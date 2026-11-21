from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

TopicDifficulty = Literal["EASY", "MEDIUM", "HARD"]
TopicStatus = Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]


class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    subject_id: UUID
    description: Optional[str] = None
    difficulty: TopicDifficulty = "MEDIUM"
    status: TopicStatus = "NOT_STARTED"


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    difficulty: Optional[TopicDifficulty] = None
    status: Optional[TopicStatus] = None


class TopicResponse(TopicBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)