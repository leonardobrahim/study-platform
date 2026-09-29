from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.task import Task
from app.models.subject import Subject
from app.models.semester import Semester
from app.models.topic import Topic
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Se enviou subject_id, verifica se a disciplina pertence ao usuário
    if task.subject_id:
        subject = db.query(Subject).join(Semester).filter(
            Subject.id == task.subject_id,
            Semester.user_id == current_user.id
        ).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Disciplina não encontrada ou não pertence a este usuário.")
            
    # Se enviou topic_id, verifica se o tópico pertence a alguma disciplina do usuário
    if task.topic_id:
        topic = db.query(Topic).join(Subject).join(Semester).filter(
            Topic.id == task.topic_id,
            Semester.user_id == current_user.id
        ).first()
        if not topic:
            raise HTTPException(status_code=404, detail="Conteúdo não encontrado ou não pertence a este usuário.")

    new_task = Task(
        user_id=current_user.id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        estimated_duration=task.estimated_duration,
        status=task.status,
        priority=task.priority,
        subject_id=task.subject_id,
        topic_id=task.topic_id
    )
    
    # Se já nasceu concluída (raro, mas possível), marca a data
    if new_task.status == "COMPLETED":
        new_task.completed_at = datetime.now(timezone.utc)
        
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    subject_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    # Filtros opcionais úteis para o Dashboard depois
    if subject_id:
        query = query.filter(Task.subject_id == subject_id)
    if status:
        query = query.filter(Task.status == status)
        
    # Ordena para as mais recentes/urgentes primeiro (baseado na data de criação por padrão)
    return query.order_by(Task.created_at.desc()).all()

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")

    update_data = task_update.model_dump(exclude_unset=True)
    
    # Lógica inteligente para data de conclusão
    if "status" in update_data:
        if update_data["status"] == "COMPLETED" and task.status != "COMPLETED":
            update_data["completed_at"] = datetime.now(timezone.utc)
        elif update_data["status"] == "PENDING":
            update_data["completed_at"] = None

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    db.delete(task)
    db.commit()
    return None