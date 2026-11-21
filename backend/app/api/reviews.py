from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewResponse, ReviewUpdate

router = APIRouter()


@router.get("/", response_model=List[ReviewResponse])
def get_reviews(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(Review)
        .options(joinedload(Review.topic))
        .filter(Review.user_id == current_user.id)
    )

    if status:
        query = query.filter(Review.status == status)

    return query.order_by(Review.due_date.asc()).all()


@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: UUID,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = (
        db.query(Review)
        .options(joinedload(Review.topic))
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Revisão não encontrada.")

    update_data = review_update.model_dump(exclude_unset=True)

    if "status" in update_data:
        if update_data["status"] == "COMPLETED" and review.status != "COMPLETED":
            update_data["completed_at"] = datetime.now(timezone.utc)
        elif update_data["status"] == "PENDING":
            update_data["completed_at"] = None

    for key, value in update_data.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)
    return review