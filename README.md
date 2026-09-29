# Plataforma de Estudos

Aplicação web para organizar estudos, acompanhar matérias, tarefas, sessões de estudo, avaliações e revisões. O projeto é composto por uma API em Python/FastAPI e uma interface em React + Vite.

## Visão geral

A plataforma foi pensada para ajudar o usuário a:

- gerenciar semestres e disciplinas;
- organizar tópicos e conteúdos de estudo;
- criar e acompanhar tarefas;
- registrar sessões de estudo;
- visualizar dashboard com métricas e progresso;
- controlar avaliações e revisões;
- consultar calendário de atividades.

## Stack tecnológica

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT para autenticação

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts

## Estrutura do projeto

```text
study-platform/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── schemas/
│   ├── .env
│   ├── requirements.txt
│   ├── alembic.ini
│   └── seed_data.py
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── .gitignore
└── README.md
```

## Conta de demonstração (Portfólio)

Para testar ou demonstrar a aplicação com dados já preenchidos (semestres, disciplinas, tópicos, tarefas e sessões de estudo):

- **Email:** `portfolio@teste.com`
- **Senha:** `portfolio123`

### Como popular o banco de dados (Seed)

Após configurar o banco de dados e aplicar as migrações (`alembic upgrade head`), execute o script de semente na pasta `backend`:

```bash
cd backend
python seed_data.py
```
*(No Windows com venv ativo: `.\venv\Scripts\python.exe seed_data.py`)*

## Requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- Python 3.10+ ou 3.11+
- Node.js 18+
- npm
- PostgreSQL local ou acessível
- Git

## Configuração do backend

1. Abra o terminal na pasta do projeto.
2. Acesse a pasta do backend:

```bash
cd backend
```

3. Crie e ative um ambiente virtual:

No Windows (PowerShell):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

No Linux/macOS:

```bash
python -m venv venv
source venv/bin/activate
```

4. Instale as dependências:

```bash
pip install -r requirements.txt
```

5. Configure a variável de ambiente do banco no arquivo `backend/.env`.

Exemplo:

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/study_platform
SECRET_KEY=sua_chave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

> Ajuste a URL conforme seu usuário, senha e nome do banco PostgreSQL local.

6. Crie o banco e aplique as migrações:

```bash
alembic upgrade head
```

7. Inicie a API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API ficará disponível em:

```text
http://localhost:8000
```

Documentação automática do Swagger:

```text
http://localhost:8000/docs
```

## Configuração do frontend

1. Abra outro terminal.
2. Acesse a pasta do frontend:

```bash
cd frontend
```

3. (Opcional) Configure a URL da API criando um arquivo `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```
> Caso não seja informado, o padrão é `http://127.0.0.1:8000/api`.

4. Instale as dependências:

```bash
npm install
```

5. Inicie a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

A interface estará disponível em:

```text
http://localhost:5173
```

## Como o projeto funciona

- O backend expõe endpoints da API para autenticação, semestres, disciplinas, tópicos, tarefas, sessões de estudo, avaliações e calendário.
- O frontend consome essa API para renderizar as telas da aplicação.
- A autenticação usa JWT e o token é enviado em requisições autenticadas via cabeçalho de autorização.

## Endpoints principais

Alguns endpoints da API incluem:

- `/api/auth/register` — cadastro de usuário
- `/api/auth/login` — login do usuário
- `/api/semesters` — gerenciamento de semestres
- `/api/subjects` — disciplinas
- `/api/topics` — tópicos
- `/api/tasks` — tarefas
- `/api/sessions` — sessões de estudo
- `/api/dashboard` — dados do dashboard
- `/api/assessments` — avaliações
- `/api/calendar` — calendário
- `/api/reviews` — revisões

## Comandos úteis

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Build de produção do frontend

```bash
cd frontend
npm run build
```

## Possíveis problemas

### Erro de banco de dados

- Verifique se o PostgreSQL está rodando.
- Confirme se o banco `study_platform` existe.
- Confira se a URL no arquivo `.env` está correta.

### Erro de dependências

- Reinstale os pacotes do backend e do frontend.
- Verifique a versão do Python e do Node.js.

### API não responde

- Certifique-se de que o backend foi iniciado com `uvicorn`.
- Verifique se a porta `8000` está disponível.

## Contribuição

Para contribuir com o projeto:

1. Crie uma branch para a feature ou correção.
2. Faça as alterações.
3. Teste localmente.
4. Abra um pull request com descrição clara das mudanças.

## Licença

Este projeto está sendo distribuído sem uma licença específica definida no repositório. Caso seja necessário, ajuste conforme a política da sua organização ou do usuário responsável.
