from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# Base compartilhada
class TopicBase(BaseModel):
    name: str
    subject_id: UUID
    description: Optional[str] = None
    difficulty: Optional[str] = "MEDIUM" # EASY, MEDIUM, HARD
    status: Optional[str] = "NOT_STARTED" # NOT_STARTED, IN_PROGRESS, COMPLETED

# Usado para criar
class TopicCreate(TopicBase):
    pass

# Usado para atualizar (todos os campos são opcionais, atualiza só o que enviar)
class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None

# O que a API devolve
class TopicResponse(TopicBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)