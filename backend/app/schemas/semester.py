from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

SemesterStatus = Literal["ACTIVE", "ARCHIVED"]


class SemesterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    year: int = Field(..., ge=2000, le=2100)
    period: int = Field(..., ge=1, le=4)
    status: SemesterStatus = "ACTIVE"


class SemesterCreate(SemesterBase):
    pass


class SemesterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    year: Optional[int] = Field(None, ge=2000, le=2100)
    period: Optional[int] = Field(None, ge=1, le=4)
    status: Optional[SemesterStatus] = None


class SemesterResponse(SemesterBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)