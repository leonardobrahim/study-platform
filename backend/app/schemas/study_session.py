from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class StudySessionStart(BaseModel):
    subject_id: UUID
    topic_id: Optional[UUID] = None


class StudySessionFinish(BaseModel):
    duration: int = Field(..., ge=0)
    notes: Optional[str] = None


class StudySessionManual(BaseModel):
    subject_id: UUID
    topic_id: Optional[UUID] = None
    duration_minutes: int = Field(..., ge=1, le=1440)
    session_date: Optional[datetime] = None
    notes: Optional[str] = None


class StudySessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject_id: UUID
    topic_id: Optional[UUID] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class StudySessionStart(BaseModel):
    subject_id: UUID
    topic_id: Optional[UUID] = None


class StudySessionFinish(BaseModel):
    duration: int = Field(..., ge=0)
    notes: Optional[str] = None


class StudySessionManual(BaseModel):
    subject_id: UUID
    topic_id: Optional[UUID] = None
    duration_minutes: int = Field(..., ge=1, le=1440)
    session_date: Optional[datetime] = None
    notes: Optional[str] = None


class StudySessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    subject_id: UUID
    topic_id: Optional[UUID] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)