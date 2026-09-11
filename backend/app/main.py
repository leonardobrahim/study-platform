from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, semesters, subjects, topics, tasks, study_sessions, dashboard

app = FastAPI(
    title="Plataforma de Estudos API",
    description="API do sistema de organização de estudos",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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

@app.get("/")
def root():
    return {"message": "API da Plataforma de Estudos está rodando!"}