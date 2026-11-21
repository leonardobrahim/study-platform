from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.review import Review
from app.models.semester import Semester
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.task import Task
from app.models.topic import Topic
from app.schemas.dashboard import (
    DashboardResponse,
    ReviewsSummary,
    SessionSummary,
    StudyTimeByDay,
    StudyTimeBySubject,
    SubjectProgress,
    TaskSummary,
)


def build_dashboard_summary(db: Session, user_id: UUID) -> DashboardResponse:
    pending_tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.status == "PENDING")
        .count()
    )

    # Ordena pelas entregas mais próximas primeiro (e tarefas sem prazo por último)
    next_tasks_db = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.status == "PENDING")
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        .limit(5)
        .all()
    )
    next_tasks = [
        TaskSummary(id=t.id, title=t.title, due_date=t.due_date)
        for t in next_tasks_db
    ]

    total_time = (
        db.query(func.sum(StudySession.duration))
        .filter(
            StudySession.user_id == user_id,
            StudySession.duration.is_not(None),
        )
        .scalar()
        or 0
    )

    recent_sessions_db = (
        db.query(StudySession, Subject.name)
        .join(Subject)
        .filter(StudySession.user_id == user_id)
        .order_by(StudySession.start_time.desc())
        .limit(3)
        .all()
    )
    recent_sessions = [
        SessionSummary(
            id=session.id,
            subject_name=subject_name,
            duration=session.duration,
            start_time=session.start_time,
        )
        for session, subject_name in recent_sessions_db
    ]

    subjects_progress = []
    active_subjects = (
        db.query(Subject)
        .join(Semester)
        .filter(Semester.user_id == user_id, Semester.status == "ACTIVE")
        .all()
    )

    total_topics_overall = 0
    completed_topics_overall = 0

    if active_subjects:
        subject_ids = [s.id for s in active_subjects]
        topics_stats = (
            db.query(
                Topic.subject_id,
                func.count(Topic.id).label("total"),
                func.sum(case((Topic.status == "COMPLETED", 1), else_=0)).label(
                    "completed"
                ),
            )
            .filter(Topic.subject_id.in_(subject_ids))
            .group_by(Topic.subject_id)
            .all()
        )

        stats_map = {
            row.subject_id: {"total": row.total, "completed": row.completed or 0}
            for row in topics_stats
        }

        for subject in active_subjects:
            stats = stats_map.get(subject.id, {"total": 0, "completed": 0})
            total_topics = stats["total"]
            completed_topics = stats["completed"]
            progress = (
                round((completed_topics / total_topics) * 100, 2)
                if total_topics > 0
                else 0.0
            )

            total_topics_overall += total_topics
            completed_topics_overall += completed_topics

            subjects_progress.append(
                SubjectProgress(
                    subject_id=subject.id,
                    name=subject.name,
                    color=subject.color,
                    progress_percentage=progress,
                )
            )

    overall_progress = (
        round((completed_topics_overall / total_topics_overall) * 100, 2)
        if total_topics_overall > 0
        else 0.0
    )

    study_time_by_subject_db = (
        db.query(Subject.name, Subject.color, func.sum(StudySession.duration))
        .join(StudySession)
        .filter(
            StudySession.user_id == user_id,
            StudySession.duration.is_not(None),
        )
        .group_by(Subject.id, Subject.name, Subject.color)
        .all()
    )
    study_time_by_subject = [
        StudyTimeBySubject(
            subject_name=row[0],
            color=row[1],
            time_seconds=int(row[2] or 0),
        )
        for row in study_time_by_subject_db
    ]

    # Janela exata começando às 00:00 de 6 dias atrás até o fim de hoje
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    window_start = today_start - timedelta(days=6)

    study_time_by_day = {
        (window_start + timedelta(days=i)).strftime("%d/%m"): 0 for i in range(7)
    }

    sessions_last_7_days = (
        db.query(StudySession.start_time, StudySession.duration)
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= window_start,
            StudySession.duration.is_not(None),
        )
        .all()
    )

    for start_time, duration in sessions_last_7_days:
        day_str = start_time.strftime("%d/%m")
        if day_str in study_time_by_day:
            study_time_by_day[day_str] += duration

    study_time_last_7_days_list = [
        StudyTimeByDay(date=k, time_seconds=v) for k, v in study_time_by_day.items()
    ]

    # Uma única query agregada para as revisões
    review_counts = (
        db.query(
            func.sum(
                case(
                    (
                        (Review.due_date >= today_start) & (Review.due_date < today_end),
                        1,
                    ),
                    else_=0,
                )
            ).label("pending_today"),
            func.sum(case((Review.due_date < today_start, 1), else_=0)).label(
                "overdue"
            ),
            func.sum(case((Review.due_date >= today_end, 1), else_=0)).label(
                "upcoming"
            ),
        )
        .filter(Review.user_id == user_id, Review.status == "PENDING")
        .first()
    )

    reviews_summary = ReviewsSummary(
        pending_today=int(review_counts.pending_today or 0) if review_counts else 0,
        overdue=int(review_counts.overdue or 0) if review_counts else 0,
        upcoming=int(review_counts.upcoming or 0) if review_counts else 0,
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
        reviews_summary=reviews_summary,
    )

from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.review import Review
from app.models.semester import Semester
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.task import Task
from app.models.topic import Topic
from app.schemas.dashboard import (
    DashboardResponse,
    ReviewsSummary,
    SessionSummary,
    StudyTimeByDay,
    StudyTimeBySubject,
    SubjectProgress,
    TaskSummary,
)


def build_dashboard_summary(db: Session, user_id: UUID) -> DashboardResponse:
    pending_tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.status == "PENDING")
        .count()
    )

    # Ordena pelas entregas mais próximas primeiro (e tarefas sem prazo por último)
    next_tasks_db = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.status == "PENDING")
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        .limit(5)
        .all()
    )
    next_tasks = [
        TaskSummary(id=t.id, title=t.title, due_date=t.due_date)
        for t in next_tasks_db
    ]

    total_time = (
        db.query(func.sum(StudySession.duration))
        .filter(
            StudySession.user_id == user_id,
            StudySession.duration.is_not(None),
        )
        .scalar()
        or 0
    )

    recent_sessions_db = (
        db.query(StudySession, Subject.name)
        .join(Subject)
        .filter(StudySession.user_id == user_id)
        .order_by(StudySession.start_time.desc())
        .limit(3)
        .all()
    )
    recent_sessions = [
        SessionSummary(
            id=session.id,
            subject_name=subject_name,
            duration=session.duration,
            start_time=session.start_time,
        )
        for session, subject_name in recent_sessions_db
    ]

    subjects_progress = []
    active_subjects = (
        db.query(Subject)
        .join(Semester)
        .filter(Semester.user_id == user_id, Semester.status == "ACTIVE")
        .all()
    )

    total_topics_overall = 0
    completed_topics_overall = 0

    if active_subjects:
        subject_ids = [s.id for s in active_subjects]
        topics_stats = (
            db.query(
                Topic.subject_id,
                func.count(Topic.id).label("total"),
                func.sum(case((Topic.status == "COMPLETED", 1), else_=0)).label(
                    "completed"
                ),
            )
            .filter(Topic.subject_id.in_(subject_ids))
            .group_by(Topic.subject_id)
            .all()
        )

        stats_map = {
            row.subject_id: {"total": row.total, "completed": row.completed or 0}
            for row in topics_stats
        }

        for subject in active_subjects:
            stats = stats_map.get(subject.id, {"total": 0, "completed": 0})
            total_topics = stats["total"]
            completed_topics = stats["completed"]
            progress = (
                round((completed_topics / total_topics) * 100, 2)
                if total_topics > 0
                else 0.0
            )

            total_topics_overall += total_topics
            completed_topics_overall += completed_topics

            subjects_progress.append(
                SubjectProgress(
                    subject_id=subject.id,
                    name=subject.name,
                    color=subject.color,
                    progress_percentage=progress,
                )
            )

    overall_progress = (
        round((completed_topics_overall / total_topics_overall) * 100, 2)
        if total_topics_overall > 0
        else 0.0
    )

    study_time_by_subject_db = (
        db.query(Subject.name, Subject.color, func.sum(StudySession.duration))
        .join(StudySession)
        .filter(
            StudySession.user_id == user_id,
            StudySession.duration.is_not(None),
        )
        .group_by(Subject.id, Subject.name, Subject.color)
        .all()
    )
    study_time_by_subject = [
        StudyTimeBySubject(
            subject_name=row[0],
            color=row[1],
            time_seconds=int(row[2] or 0),
        )
        for row in study_time_by_subject_db
    ]

    # Janela exata começando às 00:00 de 6 dias atrás até o fim de hoje
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    window_start = today_start - timedelta(days=6)

    study_time_by_day = {
        (window_start + timedelta(days=i)).strftime("%d/%m"): 0 for i in range(7)
    }

    sessions_last_7_days = (
        db.query(StudySession.start_time, StudySession.duration)
        .filter(
            StudySession.user_id == user_id,
            StudySession.start_time >= window_start,
            StudySession.duration.is_not(None),
        )
        .all()
    )

    for start_time, duration in sessions_last_7_days:
        day_str = start_time.strftime("%d/%m")
        if day_str in study_time_by_day:
            study_time_by_day[day_str] += duration

    study_time_last_7_days_list = [
        StudyTimeByDay(date=k, time_seconds=v) for k, v in study_time_by_day.items()
    ]

    # Uma única query agregada para as revisões
    review_counts = (
        db.query(
            func.sum(
                case(
                    (
                        (Review.due_date >= today_start) & (Review.due_date < today_end),
                        1,
                    ),
                    else_=0,
                )
            ).label("pending_today"),
            func.sum(case((Review.due_date < today_start, 1), else_=0)).label(
                "overdue"
            ),
            func.sum(case((Review.due_date >= today_end, 1), else_=0)).label(
                "upcoming"
            ),
        )
        .filter(Review.user_id == user_id, Review.status == "PENDING")
        .first()
    )

    reviews_summary = ReviewsSummary(
        pending_today=int(review_counts.pending_today or 0) if review_counts else 0,
        overdue=int(review_counts.overdue or 0) if review_counts else 0,
        upcoming=int(review_counts.upcoming or 0) if review_counts else 0,
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
        reviews_summary=reviews_summary,
    )