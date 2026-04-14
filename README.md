# Transcendence

## Project Overview

- Transcendence is a server-driven multiplayer web game featuring user profiles, authentication, and global leaderboards. The app is split into microservices so real-time game logic, user/profile management, and authentication can scale independently; nginx routes frontend requests to the appropriate service and PostgreSQL stores persistent data.

- [Database Structure](https://drawsql.app/teams/ilias-team-10/diagrams/transcendence-db) - Visualizes the database schema.
- [Application Architecture](https://s.icepanel.io/GVOJBUo15pQ7B3/lvV5) - Visualizes the app architecture.
- Application available at: https://valinor.ink/
- API documentation avaiable at: https://valinor.ink/api/docs

## Prerequisites

- Docker and Docker Compose v5

---

## First-Time Setup

Follow these steps in order the very first time you run the project.

### Step 1 — Install dependencies

```bash
make dev-install
```

Builds the shared `db-entities` package and runs `npm install` in every service and the frontend.

### Step 2 — Create your secrets file

Copy the template to the project root and fill in real values:

```bash
cp .env.example .env
# Edit .env with your real values
```

### Step 3 — Build and start the dev stack

```bash
make dev-build
```

This builds all Docker images, runs DB migrations, and starts every service. The app is available at **http://localhost:8080**.

---

## Daily Usage

### Start the stack (no rebuild)

```bash
make dev
```

### Stop and start

```bash
make down       # stop containers, keep volumes
make restart    # stop + start (no rebuild)
```

---

## Frontend (local, outside Docker)

```bash
make dev-front
```

## Backend docs

1. Backend dev guide: `docs/BACKEND-DEV.md`
2. API documentation: `docs/API-DOCS.md`
3. DB access inside Docker: `docs/DATABESE-DEV.md`

---

## Makefile Reference

### Dev workflow

| Command | Description |
|---------|-------------|
| `make dev-install` | Install all deps (pack-deps + npm install in each service) |
| `make dev-build` | Build images, run migrations, start dev stack |
| `make dev` | Start dev containers (no rebuild) |
| `make down` | Stop containers (keep volumes) |
| `make restart` | Stop + start |
| `make dev-front` | Run frontend locally (outside Docker) |
| `make dev-db` | Start only PostgreSQL |

### Rebuild a single service

```bash
make build-core
make build-auth
make build-gateway
make build-game
make build-frontend
make build-nginx
make build-db
```

### Logs

```bash
make logs       # all services
make log-core   # single service (log-auth, log-gateway, log-game, log-nginx, log-db)
```

### Cleanup

| Command | Description |
|---------|-------------|
| `make clean` | Stop containers, keep volumes |
| `make fclean` | Stop containers, remove volumes |
| `make prune` | fclean + prune dangling images |

### Production

```bash
make prod           # build and start prod stack
make prod-fclean    # stop prod and remove volumes
```

---

## Frontend ↔ Backend Communication

- Backend exposes a REST API under `/api/*`
- Example health endpoint:
  ```http
  GET /api/health
  ```
- Frontend fetches data using relative paths (e.g. `/api/health`)
- This allows Nginx to proxy requests in production without changing frontend code

---

## Dev Ports

| Service | URL |
|---------|-----|
| App (via Nginx) | http://localhost:8080 |
| Frontend (Vite HMR) | http://localhost:5173 |
| Gateway API | http://localhost:3002 |
| Core API + Swagger | http://localhost:3000/api/docs |
| Auth API | http://localhost:3001 |
| Game API + WS | http://localhost:3003 |
| PostgreSQL | localhost:5432 (user/pass/db: `transcendence`) |

---

## Tech Stack

### Frontend
- Node.js
- React
- Vite

### Backend
- Node.js
- NestJS
- Fastify

### Infrastructure
- Nginx
- PostgreSQL
- Docker & Docker Compose
- Hetzner VPS
