from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.assessment import Assessment
from app.models.review import Review
from app.models.study_session import StudySession
from app.models.task import Task
from app.models.topic import Topic
from app.models.user import User
from app.schemas.calendar import CalendarEvent

router = APIRouter()


@router.get("/", response_model=List[CalendarEvent])
def get_calendar_events(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    events: List[CalendarEvent] = []

    task_query = (
        db.query(Task)
        .options(joinedload(Task.subject))
        .filter(Task.user_id == current_user.id, Task.due_date.isnot(None))
    )
    if start_date:
        task_query = task_query.filter(Task.due_date >= start_date)
    if end_date:
        task_query = task_query.filter(Task.due_date <= end_date)

    for task in task_query.all():
        events.append(
            CalendarEvent(
                id=task.id,
                title=task.title,
                type="TASK",
                date=task.due_date,
                status=task.status,
                subject_name=task.subject.name if task.subject else None,
                color=task.subject.color if task.subject else None,
            )
        )

    session_query = (
        db.query(StudySession)
        .options(joinedload(StudySession.subject))
        .filter(StudySession.user_id == current_user.id)
    )
    if start_date:
        session_query = session_query.filter(StudySession.start_time >= start_date)
    if end_date:
        session_query = session_query.filter(StudySession.start_time <= end_date)

    for session in session_query.all():
        subject_name = session.subject.name if session.subject else "Sem disciplina"
        events.append(
            CalendarEvent(
                id=session.id,
                title=f"Estudo: {subject_name}",
                type="SESSION",
                date=session.start_time,
                end_date=session.end_time,
                subject_name=subject_name,
                color=session.subject.color if session.subject else None,
            )
        )

    assessment_query = (
        db.query(Assessment)
        .options(joinedload(Assessment.subject))
        .filter(Assessment.user_id == current_user.id, Assessment.date.isnot(None))
    )
    if start_date:
        assessment_query = assessment_query.filter(Assessment.date >= start_date)
    if end_date:
        assessment_query = assessment_query.filter(Assessment.date <= end_date)

    for assessment in assessment_query.all():
        events.append(
            CalendarEvent(
                id=assessment.id,
                title=f"{assessment.type}: {assessment.title}",
                type="ASSESSMENT",
                date=assessment.date,
                subject_name=assessment.subject.name if assessment.subject else None,
                color=assessment.subject.color if assessment.subject else None,
            )
        )

    review_query = (
        db.query(Review)
        .options(joinedload(Review.topic).joinedload(Topic.subject))
        .filter(Review.user_id == current_user.id)
    )
    if start_date:
        review_query = review_query.filter(Review.due_date >= start_date)
    if end_date:
        review_query = review_query.filter(Review.due_date <= end_date)

    for review in review_query.all():
        topic_name = review.topic.name if review.topic else "Conteúdo"
        subject = review.topic.subject if review.topic else None
        events.append(
            CalendarEvent(
                id=review.id,
                title=f"Revisão: {topic_name}",
                type="REVIEW",
                date=review.due_date,
                status=review.status,
                subject_name=subject.name if subject else None,
                color=subject.color if subject else None,
            )
        )

    events.sort(key=lambda x: x.date)
    return events

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.assessment import Assessment
from app.models.review import Review
from app.models.study_session import StudySession
from app.models.task import Task
from app.models.topic import Topic
from app.models.user import User
from app.schemas.calendar import CalendarEvent

router = APIRouter()


@router.get("/", response_model=List[CalendarEvent])
def get_calendar_events(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    events: List[CalendarEvent] = []

    task_query = (
        db.query(Task)
        .options(joinedload(Task.subject))
        .filter(Task.user_id == current_user.id, Task.due_date.isnot(None))
    )
    if start_date:
        task_query = task_query.filter(Task.due_date >= start_date)
    if end_date:
        task_query = task_query.filter(Task.due_date <= end_date)

    for task in task_query.all():
        events.append(
            CalendarEvent(
                id=task.id,
                title=task.title,
                type="TASK",
                date=task.due_date,
                status=task.status,
                subject_name=task.subject.name if task.subject else None,
                color=task.subject.color if task.subject else None,
            )
        )

    session_query = (
        db.query(StudySession)
        .options(joinedload(StudySession.subject))
        .filter(StudySession.user_id == current_user.id)
    )
    if start_date:
        session_query = session_query.filter(StudySession.start_time >= start_date)
    if end_date:
        session_query = session_query.filter(StudySession.start_time <= end_date)

    for session in session_query.all():
        subject_name = session.subject.name if session.subject else "Sem disciplina"
        events.append(
            CalendarEvent(
                id=session.id,
                title=f"Estudo: {subject_name}",
                type="SESSION",
                date=session.start_time,
                end_date=session.end_time,
                subject_name=subject_name,
                color=session.subject.color if session.subject else None,
            )
        )

    assessment_query = (
        db.query(Assessment)
        .options(joinedload(Assessment.subject))
        .filter(Assessment.user_id == current_user.id, Assessment.date.isnot(None))
    )
    if start_date:
        assessment_query = assessment_query.filter(Assessment.date >= start_date)
    if end_date:
        assessment_query = assessment_query.filter(Assessment.date <= end_date)

    for assessment in assessment_query.all():
        events.append(
            CalendarEvent(
                id=assessment.id,
                title=f"{assessment.type}: {assessment.title}",
                type="ASSESSMENT",
                date=assessment.date,
                subject_name=assessment.subject.name if assessment.subject else None,
                color=assessment.subject.color if assessment.subject else None,
            )
        )

    review_query = (
        db.query(Review)
        .options(joinedload(Review.topic).joinedload(Topic.subject))
        .filter(Review.user_id == current_user.id)
    )
    if start_date:
        review_query = review_query.filter(Review.due_date >= start_date)
    if end_date:
        review_query = review_query.filter(Review.due_date <= end_date)

    for review in review_query.all():
        topic_name = review.topic.name if review.topic else "Conteúdo"
        subject = review.topic.subject if review.topic else None
        events.append(
            CalendarEvent(
                id=review.id,
                title=f"Revisão: {topic_name}",
                type="REVIEW",
                date=review.due_date,
                status=review.status,
                subject_name=subject.name if subject else None,
                color=subject.color if subject else None,
            )
        )

    events.sort(key=lambda x: x.date)
    return events