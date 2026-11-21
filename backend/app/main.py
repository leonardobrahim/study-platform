from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    assessments,
    auth,
    calendar,
    dashboard,
    reviews,
    semesters,
    study_sessions,
    subjects,
    tasks,
    topics,
)
from app.core.config import settings

app = FastAPI(
    title="Plataforma de Estudos API",
    description="API do sistema de organização de estudos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(semesters.router, prefix="/api/semesters", tags=["Semestres"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Disciplinas"])
app.include_router(topics.router, prefix="/api/topics", tags=["Conteúdos"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tarefas"])
app.include_router(study_sessions.router, prefix="/api/sessions", tags=["Sessões de Estudo"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Avaliações"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendário"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Revisões"])


@app.get("/")
def root():
    return {"message": "API da Plataforma de Estudos está rodando!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}