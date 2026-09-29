from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

class CalendarEvent(BaseModel):
    id: UUID
    title: str
    type: Literal["TASK", "SESSION", "ASSESSMENT", "REVIEW"]
    date: datetime
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    subject_name: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True
