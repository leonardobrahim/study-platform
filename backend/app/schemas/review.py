from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

ReviewStatus = Literal["PENDING", "COMPLETED"]


class ReviewBase(BaseModel):
    pass


class ReviewCreate(ReviewBase):
    topic_id: UUID
    due_date: datetime
    review_number: int


class ReviewUpdate(BaseModel):
    status: Optional[ReviewStatus] = None
    completed_at: Optional[datetime] = None


class ReviewTopicResponse(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class ReviewResponse(ReviewBase):
    id: UUID
    user_id: UUID
    topic_id: UUID
    topic: Optional[ReviewTopicResponse] = None
    due_date: datetime
    completed_at: Optional[datetime]
    status: str
    review_number: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)