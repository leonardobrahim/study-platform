from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.semester import Semester
from app.schemas.dashboard import DashboardResponse, SubjectProgress, TaskSummary, SessionSummary
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

    # 4. Últimas 3 sessões de estudo (com join para pegar o nome da disciplina)
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

    for subject in active_subjects:
        total_topics = db.query(Topic).filter(Topic.subject_id == subject.id).count()
        completed_topics = db.query(Topic).filter(
            Topic.subject_id == subject.id,
            Topic.status == "COMPLETED"
        ).count()

        progress = 0.0
        if total_topics > 0:
            progress = round((completed_topics / total_topics) * 100, 2)

        subjects_progress.append(
            SubjectProgress(
                subject_id=subject.id,
                name=subject.name,
                color=subject.color,
                progress_percentage=progress
            )
        )

    return DashboardResponse(
        total_time_studied_seconds=int(total_time),
        pending_tasks_count=pending_tasks,
        subjects_progress=subjects_progress,
        next_tasks=next_tasks,
        recent_sessions=recent_sessions
    )