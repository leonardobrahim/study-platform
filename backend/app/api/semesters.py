from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.semester import Semester
from app.schemas.semester import SemesterCreate, SemesterResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
def create_semester(
    semester: SemesterCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <- PROTEÇÃO AQUI
):
    # Cria o semestre atrelando ao ID do usuário logado
    new_semester = Semester(
        name=semester.name,
        year=semester.year,
        period=semester.period,
        status=semester.status,
        user_id=current_user.id
    )
    db.add(new_semester)
    db.commit()
    db.refresh(new_semester)
    return new_semester

@router.get("/", response_model=List[SemesterResponse])
def get_semesters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <- PROTEÇÃO AQUI
):
    # Busca apenas os semestres DO USUÁRIO LOGADO
    semesters = db.query(Semester).filter(Semester.user_id == current_user.id).all()
    return semesters