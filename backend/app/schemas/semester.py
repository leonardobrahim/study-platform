from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# Base compartilhada
class SemesterBase(BaseModel):
    name: str
    year: int
    period: int
    status: Optional[str] = "ACTIVE" # ACTIVE ou ARCHIVED

# O que o usuário envia para criar (herda a Base)
class SemesterCreate(SemesterBase):
    pass

# O que a API devolve
class SemesterResponse(SemesterBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)