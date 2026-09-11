from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None # em minutos
    status: Optional[str] = "PENDING" # PENDING, COMPLETED
    priority: Optional[str] = "MEDIUM" # LOW, MEDIUM, HIGH
    subject_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    subject_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None

class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)