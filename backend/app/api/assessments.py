from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.assessment import Assessment
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, AssessmentUpdate

router = APIRouter()


def _validate_topics_for_subject(
    db: Session,
    topic_ids: List[UUID],
    subject_id: UUID,
    user_id: UUID,
) -> List[Topic]:
    unique_ids = list(dict.fromkeys(topic_ids))
    if not unique_ids:
        return []

    topics = (
        db.query(Topic)
        .join(Subject)
        .join(Semester)
        .filter(
            Topic.id.in_(unique_ids),
            Semester.user_id == user_id,
        )
        .all()
    )
    if len(topics) != len(unique_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Um ou mais conteúdos não foram encontrados.",
        )

    for topic in topics:
        if topic.subject_id != subject_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Todos os conteúdos precisam pertencer à disciplina da avaliação.",
            )
    return topics


@router.get("", response_model=List[AssessmentResponse])
def get_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Assessment)
        .options(selectinload(Assessment.topics), joinedload(Assessment.subject))
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.date.asc().nullslast())
        .all()
    )


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_in: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = (
        db.query(Subject)
        .join(Semester)
        .filter(
            Subject.id == assessment_in.subject_id,
            Semester.user_id == current_user.id,
        )
        .first()
    )
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada.",
        )

    topics = _validate_topics_for_subject(
        db,
        assessment_in.topic_ids,
        assessment_in.subject_id,
        current_user.id,
    )

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
    current_user: User = Depends(get_current_user),
):
    db_assessment = (
        db.query(Assessment)
        .options(selectinload(Assessment.topics), joinedload(Assessment.subject))
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada.",
        )

    update_data = assessment_in.model_dump(exclude_unset=True)

    if "topic_ids" in update_data:
        topic_ids = update_data.pop("topic_ids") or []
        db_assessment.topics = _validate_topics_for_subject(
            db,
            topic_ids,
            db_assessment.subject_id,
            current_user.id,
        )

    for field, value in update_data.items():
        setattr(db_assessment, field, value)

    db.commit()
    db.refresh(db_assessment)
    return db_assessment


@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_assessment = (
        db.query(Assessment)
        .filter(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
        .first()
    )
    if not db_assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada.",
        )

    db.delete(db_assessment)
    db.commit()
    return None