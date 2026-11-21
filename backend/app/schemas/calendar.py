from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CalendarEvent(BaseModel):
    id: UUID
    title: str
    type: Literal["TASK", "SESSION", "ASSESSMENT", "REVIEW"]
    date: datetime
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    subject_name: Optional[str] = None
    color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CalendarEvent(BaseModel):
    id: UUID
    title: str
    type: Literal["TASK", "SESSION", "ASSESSMENT", "REVIEW"]
    date: datetime
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    subject_name: Optional[str] = None
    color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)