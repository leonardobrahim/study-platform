from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.topic import TopicResponse
from app.schemas.subject import SubjectResponse

AssessmentType = Literal["PROVA", "TRABALHO"]


class AssessmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: AssessmentType = "PROVA"
    date: Optional[datetime] = None
    subject_id: UUID


class AssessmentCreate(AssessmentBase):
    topic_ids: List[UUID] = []


class AssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[AssessmentType] = None
    date: Optional[datetime] = None
    topic_ids: Optional[List[UUID]] = None


class AssessmentResponse(AssessmentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    topics: List[TopicResponse] = []
    subject: Optional[SubjectResponse] = None

    model_config = ConfigDict(from_attributes=True)