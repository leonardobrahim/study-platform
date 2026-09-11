from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

# Dados para INICIAR a sessão
class StudySessionStart(BaseModel):
    subject_id: UUID
    topic_id: Optional[UUID] = None

# Dados para FINALIZAR a sessão (o frontend manda a duração descontando as pausas)
class StudySessionFinish(BaseModel):
    duration: int # em segundos
    notes: Optional[str] = None

# O que a API devolve
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