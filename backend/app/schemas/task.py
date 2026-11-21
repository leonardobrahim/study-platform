from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

TaskStatus = Literal["PENDING", "COMPLETED"]
TaskPriority = Literal["LOW", "MEDIUM", "HIGH"]


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = Field(None, ge=1)
    status: TaskStatus = "PENDING"
    priority: TaskPriority = "MEDIUM"
    subject_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = Field(None, ge=1)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    subject_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None


class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)