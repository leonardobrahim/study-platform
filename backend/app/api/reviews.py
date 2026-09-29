from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewResponse, ReviewUpdate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ReviewResponse])
def get_reviews(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Review).filter(Review.user_id == current_user.id)
    
    if status:
        query = query.filter(Review.status == status)
        
    return query.order_by(Review.due_date.asc()).all()

@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: UUID,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Revisão não encontrada.")

    update_data = review_update.model_dump(exclude_unset=True)
    
    # Lógica inteligente para data de conclusão
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
