from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.subject import Subject
from app.models.semester import Semester
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: SubjectCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    semester = db.query(Semester).filter(
        Semester.id == subject.semester_id, 
        Semester.user_id == current_user.id
    ).first()
    
    if not semester:
        raise HTTPException(
            status_code=404, 
            detail="Semestre não encontrado ou não pertence a este usuário."
        )

    new_subject = Subject(
        name=subject.name,
        semester_id=subject.semester_id,
        code=subject.code,
        professor=subject.professor,
        description=subject.description,
        color=subject.color
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject

@router.get("/", response_model=List[SubjectResponse])
def get_subjects(
    semester_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Subject).join(Semester).filter(Semester.user_id == current_user.id)
    
    if semester_id:
        query = query.filter(Subject.semester_id == semester_id)
        
    return query.all()

@router.patch("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: UUID,
    subject_update: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Garante que a disciplina existe e pertence ao usuário logado
    subject = db.query(Subject).join(Semester).filter(
        Subject.id == subject_id,
        Semester.user_id == current_user.id
    ).first()

    if not subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")

    update_data = subject_update.model_dump(exclude_unset=True)

    # Se está tentando mover a disciplina de semestre, valida que o destino também é do usuário
    if "semester_id" in update_data:
        target_semester = db.query(Semester).filter(
            Semester.id == update_data["semester_id"],
            Semester.user_id == current_user.id
        ).first()
        if not target_semester:
            raise HTTPException(
                status_code=404,
                detail="Semestre de destino não encontrado ou não pertence a este usuário."
            )

    for key, value in update_data.items():
        setattr(subject, key, value)

    db.commit()
    db.refresh(subject)
    return subject