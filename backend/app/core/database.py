import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Pega a URL do banco de dados
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Cria o "motor" de conexão
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Cria a fábrica de sessões (usada para conversar com o banco)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base que todos os nossos modelos vão herdar
Base = declarative_base()

# Função auxiliar para injetar a sessão do banco nas rotas do FastAPI (usaremos em breve)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()