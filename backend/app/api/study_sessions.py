from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.semester import Semester
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.user import User
from app.schemas.study_session import (
    StudySessionFinish,
    StudySessionManual,
    StudySessionResponse,
    StudySessionStart,
)

router = APIRouter()


def _validate_subject_and_optional_topic(
    db: Session,
    user_id: UUID,
    subject_id: UUID,
    topic_id: Optional[UUID],
) -> None:
    subject = (
        db.query(Subject)
        .join(Semester)
        .filter(Subject.id == subject_id, Semester.user_id == user_id)
        .first()
    )
    if not subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")

    if topic_id:
        topic = (
            db.query(Topic)
            .filter(Topic.id == topic_id, Topic.subject_id == subject_id)
            .first()
        )
        if not topic:
            raise HTTPException(
                status_code=404,
                detail="Conteúdo não encontrado nesta disciplina.",
            )


@router.post("/start", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    session_data: StudySessionStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active_session = (
        db.query(StudySession)
        .filter(
            StudySession.user_id == current_user.id,
            StudySession.end_time.is_(None),
        )
        .first()
    )

    if active_session:
        raise HTTPException(
            status_code=400,
            detail="Você já tem uma sessão de estudo em andamento. Finalize-a primeiro.",
        )

    _validate_subject_and_optional_topic(
        db,
        current_user.id,
        session_data.subject_id,
        session_data.topic_id,
    )

    new_session = StudySession(
        user_id=current_user.id,
        subject_id=session_data.subject_id,
        topic_id=session_data.topic_id,
        start_time=datetime.now(timezone.utc),
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.patch("/{session_id}/finish", response_model=StudySessionResponse)
def finish_session(
    session_id: UUID,
    finish_data: StudySessionFinish,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
            StudySession.end_time.is_(None),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão ativa não encontrada ou já finalizada.",
        )

    session.end_time = datetime.now(timezone.utc)
    session.duration = finish_data.duration
    if finish_data.notes:
        session.notes = finish_data.notes

    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[StudySessionResponse])
def get_sessions(
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)

    if active_only:
        query = query.filter(StudySession.end_time.is_(None))

    return query.order_by(StudySession.start_time.desc()).all()


@router.post("/manual", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def create_manual_session(
    session_data: StudySessionManual,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _validate_subject_and_optional_topic(
        db,
        current_user.id,
        session_data.subject_id,
        session_data.topic_id,
    )

    start_time = session_data.session_date or datetime.now(timezone.utc)
    duration_seconds = session_data.duration_minutes * 60
    end_time = start_time + timedelta(seconds=duration_seconds)

    new_session = StudySession(
        user_id=current_user.id,
        subject_id=session_data.subject_id,
        topic_id=session_data.topic_id,
        start_time=start_time,
        end_time=end_time,
        duration=duration_seconds,
        notes=session_data.notes,
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(StudySession)
        .filter(
            StudySession.id == session_id,
            StudySession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sessão de estudo não encontrada.")

    db.delete(session)
    db.commit()
    return None