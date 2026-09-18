from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.study_session import StudySession
from app.models.assessment import Assessment
from app.schemas.calendar import CalendarEvent

router = APIRouter()

@router.get("/", response_model=List[CalendarEvent])
def get_calendar_events(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = []

    # 1. Fetch Tasks
    task_query = db.query(Task).filter(Task.user_id == current_user.id, Task.due_date.isnot(None))
    if start_date:
        task_query = task_query.filter(Task.due_date >= start_date)
    if end_date:
        task_query = task_query.filter(Task.due_date <= end_date)
    
    for task in task_query.all():
        events.append(CalendarEvent(
            id=task.id,
            title=task.title,
            type="TASK",
            date=task.due_date,
            status=task.status,
            subject_name=task.subject.name if task.subject else None,
            color=task.subject.color if task.subject else None
        ))

    # 2. Fetch Study Sessions
    session_query = db.query(StudySession).filter(StudySession.user_id == current_user.id)
    if start_date:
        session_query = session_query.filter(StudySession.start_time >= start_date)
    if end_date:
        session_query = session_query.filter(StudySession.start_time <= end_date)

    for session in session_query.all():
        events.append(CalendarEvent(
            id=session.id,
            title=f"Estudo: {session.subject.name}",
            type="SESSION",
            date=session.start_time,
            end_date=session.end_time,
            subject_name=session.subject.name,
            color=session.subject.color
        ))

    # 3. Fetch Assessments
    assessment_query = db.query(Assessment).filter(Assessment.user_id == current_user.id, Assessment.date.isnot(None))
    if start_date:
        assessment_query = assessment_query.filter(Assessment.date >= start_date)
    if end_date:
        assessment_query = assessment_query.filter(Assessment.date <= end_date)
    
    for assessment in assessment_query.all():
        events.append(CalendarEvent(
            id=assessment.id,
            title=f"{assessment.type}: {assessment.title}",
            type="ASSESSMENT",
            date=assessment.date,
            subject_name=assessment.subject.name if assessment.subject else None,
            color=assessment.subject.color if assessment.subject else None
        ))

    # Sort all events by date
    events.sort(key=lambda x: x.date)

    return events
