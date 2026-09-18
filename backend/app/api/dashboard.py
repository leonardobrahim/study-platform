from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.semester import Semester
from app.models.review import Review
from app.schemas.dashboard import (
    DashboardResponse, SubjectProgress, TaskSummary, SessionSummary,
    StudyTimeBySubject, StudyTimeByDay, ReviewsSummary
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Total de Tarefas Pendentes
    pending_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "PENDING"
    ).count()

    # 2. Próximas 5 tarefas
    next_tasks_db = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == "PENDING"
    ).order_by(Task.created_at.desc()).limit(5).all()
    
    next_tasks = [
        TaskSummary(id=t.id, title=t.title, due_date=t.due_date) for t in next_tasks_db
    ]

    # 3. Tempo total estudado (soma de todas as sessões finalizadas)
    total_time = db.query(func.sum(StudySession.duration)).filter(
        StudySession.user_id == current_user.id,
        StudySession.duration.is_not(None)
    ).scalar() or 0

    # 4. Últimas 3 sessões de estudo
    recent_sessions_db = db.query(StudySession, Subject.name).join(Subject).filter(
        StudySession.user_id == current_user.id
    ).order_by(StudySession.start_time.desc()).limit(3).all()
    
    recent_sessions = [
        SessionSummary(
            id=session.id, 
            subject_name=subject_name, 
            duration=session.duration, 
            start_time=session.start_time
        ) for session, subject_name in recent_sessions_db
    ]

    # 5. Cálculo de Progresso das Disciplinas Ativas
    subjects_progress = []
    active_subjects = db.query(Subject).join(Semester).filter(
        Semester.user_id == current_user.id,
        Semester.status == "ACTIVE"
    ).all()

    total_topics_overall = 0
    completed_topics_overall = 0

    for subject in active_subjects:
        total_topics = db.query(Topic).filter(Topic.subject_id == subject.id).count()
        completed_topics = db.query(Topic).filter(
            Topic.subject_id == subject.id,
            Topic.status == "COMPLETED"
        ).count()

        progress = 0.0
        if total_topics > 0:
            progress = round((completed_topics / total_topics) * 100, 2)

        total_topics_overall += total_topics
        completed_topics_overall += completed_topics

        subjects_progress.append(
            SubjectProgress(
                subject_id=subject.id,
                name=subject.name,
                color=subject.color,
                progress_percentage=progress
            )
        )

    # 6. Progresso Geral
    overall_progress = 0.0
    if total_topics_overall > 0:
        overall_progress = round((completed_topics_overall / total_topics_overall) * 100, 2)

    # 7. Tempo de Estudo por Disciplina (Pie Chart)
    study_time_by_subject_db = db.query(
        Subject.name, Subject.color, func.sum(StudySession.duration)
    ).join(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.duration.is_not(None)
    ).group_by(Subject.id).all()

    study_time_by_subject = [
        StudyTimeBySubject(
            subject_name=row[0],
            color=row[1],
            time_seconds=int(row[2] or 0)
        ) for row in study_time_by_subject_db
    ]

    # 8. Tempo de Estudo por Dia nos Últimos 7 dias (Bar Chart)
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    
    # Preencher array de 7 dias com 0s para garantir que todos os dias aparecem no gráfico
    study_time_by_day = {}
    for i in range(6, -1, -1):
        d = (now - timedelta(days=i)).strftime('%d/%m')
        study_time_by_day[d] = 0

    # Func date cast varies by database. Since we use SQLite in dev (presumably) or PostgreSQL, 
    # we can group by extracting string or we do it in Python memory since it's just 7 dias.
    # To be db-agnostic and simple, let's fetch sessions from last 7 days and process in memory.
    sessions_last_7_days = db.query(StudySession.start_time, StudySession.duration).filter(
        StudySession.user_id == current_user.id,
        StudySession.start_time >= seven_days_ago,
        StudySession.duration.is_not(None)
    ).all()

    for start_time, duration in sessions_last_7_days:
        day_str = start_time.strftime('%d/%m')
        if day_str in study_time_by_day:
            study_time_by_day[day_str] += duration

    study_time_last_7_days_list = [
        StudyTimeByDay(date=k, time_seconds=v) for k, v in study_time_by_day.items()
    ]

    # 9. Resumo das Revisões (Spaced Repetition)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    pending_today = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.status == "PENDING",
        Review.due_date >= today_start,
        Review.due_date < today_end
    ).count()

    overdue = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.status == "PENDING",
        Review.due_date < today_start
    ).count()

    upcoming = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.status == "PENDING",
        Review.due_date >= today_end
    ).count()

    reviews_summary = ReviewsSummary(
        pending_today=pending_today,
        overdue=overdue,
        upcoming=upcoming
    )

    return DashboardResponse(
        total_time_studied_seconds=int(total_time),
        pending_tasks_count=pending_tasks,
        overall_progress_percentage=overall_progress,
        subjects_progress=subjects_progress,
        next_tasks=next_tasks,
        recent_sessions=recent_sessions,
        study_time_by_subject=study_time_by_subject,
        study_time_last_7_days=study_time_last_7_days_list,
        reviews_summary=reviews_summary
    )