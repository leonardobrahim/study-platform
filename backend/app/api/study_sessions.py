from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.study_session import StudySession
from app.models.subject import Subject
from app.models.semester import Semester
from app.schemas.study_session import StudySessionStart, StudySessionFinish, StudySessionResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/start", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    session_data: StudySessionStart, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verifica se já existe uma sessão em andamento para este usuário
    active_session = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.end_time.is_(None)
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=400, 
            detail="Você já tem uma sessão de estudo em andamento. Finalize-a primeiro."
        )

    # 2. Verifica se a disciplina existe e pertence ao usuário
    subject = db.query(Subject).join(Semester).filter(
        Subject.id == session_data.subject_id,
        Semester.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")

    # 3. Inicia a sessão
    new_session = StudySession(
        user_id=current_user.id,
        subject_id=session_data.subject_id,
        topic_id=session_data.topic_id,
        start_time=datetime.now(timezone.utc)
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
    current_user: User = Depends(get_current_user)
):
    # Busca a sessão que está ativa
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id,
        StudySession.end_time.is_(None)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Sessão ativa não encontrada ou já finalizada.")

    # Atualiza com os dados finais
    session.end_time = datetime.now(timezone.utc)
    session.duration = finish_data.duration
    if finish_data.notes:
        session.notes = finish_data.notes

    db.commit()
    db.refresh(session)
    return session

@router.get("/", response_model=List[StudySessionResponse])
def get_sessions(
    active_only: bool = False, # Permite buscar apenas a sessão que está rodando agora
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)
    
    if active_only:
        query = query.filter(StudySession.end_time.is_(None))
        
    return query.order_by(StudySession.start_time.desc()).all()