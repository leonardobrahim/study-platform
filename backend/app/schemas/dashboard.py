from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SubjectProgress(BaseModel):
    subject_id: UUID
    name: str
    color: Optional[str] = None
    progress_percentage: float

class TaskSummary(BaseModel):
    id: UUID
    title: str
    due_date: Optional[datetime] = None

class SessionSummary(BaseModel):
    id: UUID
    subject_name: str
    duration: Optional[int] = None
    start_time: datetime

class DashboardResponse(BaseModel):
    total_time_studied_seconds: int
    pending_tasks_count: int
    overall_progress_percentage: float
    subjects_progress: List[SubjectProgress]
    next_tasks: List[TaskSummary]
    recent_sessions: List[SessionSummary]