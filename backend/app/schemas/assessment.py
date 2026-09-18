from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.schemas.topic import TopicResponse
from app.schemas.subject import SubjectResponse

class AssessmentBase(BaseModel):
    title: str
    type: str = "PROVA" # PROVA, TRABALHO
    date: Optional[datetime] = None
    subject_id: UUID

class AssessmentCreate(AssessmentBase):
    topic_ids: List[UUID] = []

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    date: Optional[datetime] = None
    topic_ids: Optional[List[UUID]] = None

class AssessmentResponse(AssessmentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    topics: List[TopicResponse] = []
    # We may need subject in the response to display its name and color
    subject: Optional[SubjectResponse] = None

    model_config = ConfigDict(from_attributes=True)
