from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.review import Review
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.user import User
from app.schemas.topic import TopicCreate, TopicResponse, TopicUpdate

router = APIRouter()


@router.post("/", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    topic: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = (
        db.query(Subject)
        .join(Semester)
        .filter(Subject.id == topic.subject_id, Semester.user_id == current_user.id)
        .first()
    )

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Disciplina não encontrada ou não pertence a este usuário.",
        )

    new_topic = Topic(
        name=topic.name,
        subject_id=topic.subject_id,
        description=topic.description,
        difficulty=topic.difficulty,
        status=topic.status,
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic


@router.get("/", response_model=List[TopicResponse])
def get_topics(
    subject_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Topic)
        .join(Subject)
        .join(Semester)
        .filter(Semester.user_id == current_user.id)
    )

    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)

    return query.all()


@router.patch("/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: UUID,
    topic_update: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = (
        db.query(Topic)
        .join(Subject)
        .join(Semester)
        .filter(Topic.id == topic_id, Semester.user_id == current_user.id)
        .first()
    )

    if not topic:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")

    update_data = topic_update.model_dump(exclude_unset=True)

    status_changed_to_completed = (
        "status" in update_data
        and update_data["status"] == "COMPLETED"
        and topic.status != "COMPLETED"
    )
    status_changed_from_completed = (
        "status" in update_data
        and update_data["status"] != "COMPLETED"
        and topic.status == "COMPLETED"
    )

    for key, value in update_data.items():
        setattr(topic, key, value)

    if status_changed_to_completed:
        db.query(Review).filter(
            Review.topic_id == topic.id,
            Review.status == "PENDING",
        ).delete()

        now = datetime.now(timezone.utc)
        db.add_all(
            [
                Review(
                    user_id=current_user.id,
                    topic_id=topic.id,
                    due_date=now + timedelta(days=1),
                    review_number=1,
                ),
                Review(
                    user_id=current_user.id,
                    topic_id=topic.id,
                    due_date=now + timedelta(days=7),
                    review_number=2,
                ),
                Review(
                    user_id=current_user.id,
                    topic_id=topic.id,
                    due_date=now + timedelta(days=30),
                    review_number=3,
                ),
            ]
        )
    elif status_changed_from_completed:
        db.query(Review).filter(
            Review.topic_id == topic.id,
            Review.status == "PENDING",
        ).delete()

    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = (
        db.query(Topic)
        .join(Subject)
        .join(Semester)
        .filter(Topic.id == topic_id, Semester.user_id == current_user.id)
        .first()
    )

    if not topic:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado.")

    db.delete(topic)
    db.commit()
    return None