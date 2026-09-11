from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime

# Dados que o usuário envia ao se cadastrar
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Dados que a API devolve (sem a senha!)
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime

    # Necessário para o Pydantic ler objetos do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# Dados do Token de Login
class Token(BaseModel):
    access_token: str
    token_type: str