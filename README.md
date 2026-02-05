# Transcendence

## Project Overview

- Transcendence is a server-driven multiplayer web game featuring user profiles, authentication, and global leaderboards. The app is split into microservices so real-time game logic, user/profile management, and authentication can scale independently; nginx routes frontend requests to the appropriate service and PostgreSQL stores persistent data.

- [Database Structure](https://drawsql.app/teams/ilias-team-10/diagrams/transcendence-db) - Visualizes the database schema.
- [Application Architecture](https://s.icepanel.io/GVOJBUo15pQ7B3/lvV5) - Visualizes the app architecture.

## Prerequisites

- Docker and Docker Compose v5

## Installation (backend + frontend)

Run once to install dependencies:
```bash
make dev-install
```

Build and start the development stack + db migration:
```bash
make dev-build
```

Start the development services (no rebuild):
```bash
make dev
```

## Frontend (local)

Start only frontend
```bash
make dev-front
```

## Backend

NOTE: (from Ilia) I moved all documentation related to backend and API endpoints to `docs/` dir. Find all there.

1. If you need to run backend, read:
```bash
/docs/BACKEND-DEV.md
```
2. API documentation, read:
```bash
/docs/API-DOCS.md
```
3. If you need to check db inside docker container, read:
```bash
/docs/DATABESE-DEV.md
```


### 🔹 clean

Stop containers (keeps volumes).

```bash
make clean
```

### 🔹 fclean

Stop containers and remove volumes (full reset).

```bash
make fclean
```

### 🔹 reb, ref, rng, rdb

Rebuild of separate service:

- `reb` - backend
- `ref` - frontend
- `rng` - nginx
- `rdb` - PostgreSQL

```bash
make reb  # rebuild backend
make ref  # rebuild frontend
make rng  # rebuild nginx
make rdb  # rebuild PostgreSQL
```

### 🔹 prune

Clean dangling images

```bash
make prune
```

### 🔹 prod

Start production stack (build + detached).

```bash
make prod
```

## Architecture (Development)

- Frontend: React (Vite)
- Backend: NestJS (Express)
- Database: PostgreSQL (planned)
- Communication: REST API under `/api`

The frontend communicates with the backend via `/api/*` endpoints.
During development, the frontend runs on port 5173 and the backend on port 3000.

A health check endpoint is available at:
GET /api/health


## Frontend ↔ Backend Communication

- Backend exposes a REST API under `/api/*`
- Example health endpoint:
  ```http
  GET /api/health
  ```
- Frontend fetches data using relative paths (e.g. `/api/health`)
- This allows Nginx to proxy requests in production without changing frontend code

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
- Google Cloud
