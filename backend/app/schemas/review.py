from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ReviewBase(BaseModel):
    pass

class ReviewCreate(ReviewBase):
    topic_id: UUID
    due_date: datetime
    review_number: int

class ReviewUpdate(BaseModel):
    status: Optional[str] = None
    completed_at: Optional[datetime] = None

class ReviewTopicResponse(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True

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

    class Config:
        from_attributes = True
