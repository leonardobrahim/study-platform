from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.assessment import Assessment
from app.models.topic import Topic
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

@router.get("", response_model=List[AssessmentResponse])
def get_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).order_by(Assessment.date.asc()).all()
    return assessments

@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_in: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch requested topics and verify ownership
    topics = []
    if assessment_in.topic_ids:
        topics = db.query(Topic).filter(Topic.id.in_(assessment_in.topic_ids)).all()
        # Ensure all requested topics exist and belong to the correct subject
        if len(topics) != len(assessment_in.topic_ids):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more topics not found")
        for topic in topics:
            # Optionally check if topic.subject.semester.user_id == current_user.id
            # Or just check if topic.subject_id == assessment_in.subject_id
            if topic.subject_id != assessment_in.subject_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Topic {topic.id} does not belong to subject {assessment_in.subject_id}")

    db_assessment = Assessment(
        title=assessment_in.title,
        type=assessment_in.type,
        date=assessment_in.date,
        subject_id=assessment_in.subject_id,
        user_id=current_user.id,
    )
    db_assessment.topics = topics

    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.patch("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: UUID,
    assessment_in: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not db_assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    update_data = assessment_in.model_dump(exclude_unset=True)
    
    # Handle topics update separately
    if "topic_ids" in update_data:
        topic_ids = update_data.pop("topic_ids")
        topics = []
        if topic_ids:
            topics = db.query(Topic).filter(Topic.id.in_(topic_ids)).all()
            if len(topics) != len(topic_ids):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more topics not found")
            for topic in topics:
                if topic.subject_id != db_assessment.subject_id:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Topic {topic.id} does not belong to subject {db_assessment.subject_id}")
        db_assessment.topics = topics

    for field, value in update_data.items():
        setattr(db_assessment, field, value)

    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not db_assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    db.delete(db_assessment)
    db.commit()
    return None
