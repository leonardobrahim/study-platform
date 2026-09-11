from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.subject import Subject
from app.models.semester import Semester
from app.schemas.subject import SubjectCreate, SubjectResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: SubjectCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Regra de Segurança: Verifica se o semestre existe e PERTENCE ao usuário logado
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
    semester_id: Optional[UUID] = None, # Parâmetro opcional para filtrar por semestre
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Inicia a busca cruzando Disciplina e Semestre
    query = db.query(Subject).join(Semester).filter(Semester.user_id == current_user.id)
    
    # Se o usuário passar um semester_id na URL, filtramos os resultados
    if semester_id:
        query = query.filter(Subject.semester_id == semester_id)
        
    return query.all()