# Full-Stack SaaS Starter

A clean starter project with a Next.js + Tailwind frontend and a FastAPI + PostgreSQL backend. It includes JWT authentication, SQLAlchemy models, REST API routing, and a folder structure that can grow without getting tangled.

## Folder Structure

```text
saas-starter/
  docker-compose.yml
  README.md
  frontend/
    app/
      dashboard/
      listings/
      leads/
      login/
      register/
    components/
    lib/
  backend/
    app/
      api/v1/endpoints/
      core/
      db/
      models/
      schemas/
      services/
    tests/
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker, for local PostgreSQL

## 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

## 2. Run the Backend

```bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive docs:

```text
http://localhost:8000/docs
```

On startup, the backend creates tables automatically for local development. For production, add Alembic migrations before shipping schema changes.

## 3. Run the Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Auth Flow

- `POST /api/v1/auth/register` creates a user and returns a JWT.
- `POST /api/v1/auth/login` validates credentials and returns a JWT.
- Protected endpoints require `Authorization: Bearer <token>`.
- The frontend stores the token in `localStorage` for starter simplicity.

For production, consider httpOnly cookies, refresh tokens, email verification, password reset, rate limiting, and a real migration workflow.

## Useful API Endpoints

```text
GET    /health
GET    /listings
POST   /listings
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me
GET    /api/v1/listings
POST   /api/v1/listings
GET    /api/v1/leads
POST   /api/v1/leads
```

Property listing payload:

```json
{
  "title": "Modern Loft",
  "location": "Downtown",
  "price": 250000,
  "size": 1200,
  "description": "Bright property near transit."
}
```

If `description` is empty, the backend attempts to generate a concise real estate description with OpenAI and returns it in `generated_description`.

## Environment Variables

Backend:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/saas_starter
SECRET_KEY=change-me-in-production
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
