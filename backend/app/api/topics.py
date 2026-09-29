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
    
    # Verifica transição de status
    from datetime import datetime, timedelta, timezone
    from app.models.review import Review
    
    status_changed_to_completed = False
    status_changed_from_completed = False
    
    if "status" in update_data:
        if update_data["status"] == "COMPLETED" and topic.status != "COMPLETED":
            status_changed_to_completed = True
        elif update_data["status"] != "COMPLETED" and topic.status == "COMPLETED":
            status_changed_from_completed = True
        
    # Atualiza dinamicamente as colunas no banco
    for key, value in update_data.items():
        setattr(topic, key, value)

    if status_changed_to_completed:
        # Remove revisões antigas (se existirem) para evitar duplicação
        db.query(Review).filter(Review.topic_id == topic.id).delete()
        
        now = datetime.now(timezone.utc)
        review1 = Review(user_id=current_user.id, topic_id=topic.id, due_date=now + timedelta(days=1), review_number=1)
        review2 = Review(user_id=current_user.id, topic_id=topic.id, due_date=now + timedelta(days=7), review_number=2)
        review3 = Review(user_id=current_user.id, topic_id=topic.id, due_date=now + timedelta(days=30), review_number=3)
        db.add_all([review1, review2, review3])
    elif status_changed_from_completed:
        # Se desmarcou como concluído, remove as revisões pendentes desse tópico
        db.query(Review).filter(Review.topic_id == topic.id).delete()

    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic = db.query(Topic).join(Subject).join(Semester).filter(
        Topic.id == topic_id,
        Semester.user_id == current_user.id
    ).first()

    if not topic:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")

    db.delete(topic)
    db.commit()
    return None