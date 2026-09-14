from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# Base compartilhada
class SubjectBase(BaseModel):
    name: str
    semester_id: UUID
    code: Optional[str] = None
    professor: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

# Dados para criação
class SubjectCreate(SubjectBase):
    pass

# Dados para atualização (todos opcionais)
class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    semester_id: Optional[UUID] = None
    code: Optional[str] = None
    professor: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

# Dados que a API devolve
class SubjectResponse(SubjectBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)