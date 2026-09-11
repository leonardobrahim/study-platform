from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.topic import Topic
from app.models.subject import Subject
from app.models.semester import Semester
from app.schemas.topic import TopicCreate, TopicUpdate, TopicResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic: TopicCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Regra de Segurança: Verifica se a disciplina existe e pertence ao usuário
    subject = db.query(Subject).join(Semester).filter(
        Subject.id == topic.subject_id,
        Semester.user_id == current_user.id
    ).first()
    
    if not subject:
        raise HTTPException(
            status_code=404, 
            detail="Disciplina não encontrada ou não pertence a este usuário."
        )

    new_topic = Topic(
        name=topic.name,
        subject_id=topic.subject_id,
        description=topic.description,
        difficulty=topic.difficulty,
        status=topic.status
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.get("/", response_model=List[TopicResponse])
def get_topics(
    subject_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Pega apenas tópicos do usuário logado (fazendo os joins necessários)
    query = db.query(Topic).join(Subject).join(Semester).filter(Semester.user_id == current_user.id)
    
    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
        
    return query.all()

@router.patch("/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: UUID,
    topic_update: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Busca o tópico garantindo que pertence ao usuário logado
    topic = db.query(Topic).join(Subject).join(Semester).filter(
        Topic.id == topic_id,
        Semester.user_id == current_user.id
    ).first()

    if not topic:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")

    # exclude_unset=True garante que ele só pegue os campos que você enviou no JSON
    update_data = topic_update.model_dump(exclude_unset=True)
    
    # Atualiza dinamicamente as colunas no banco
    for key, value in update_data.items():
        setattr(topic, key, value)

    db.commit()
    db.refresh(topic)
    return topic