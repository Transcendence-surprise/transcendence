# Transcendence

Backend:

npm run start:dev

Health checkpoint

GET /api/health
https://automatic-space-spork-69975pq577rc5g5-3000.app.github.dev/api/health

Frontend:

npm run dev

## Makefile
Development

Frontend:

make dev        # run Postgres

make dev-front  # run Vite

Backend:

make dev        # run Postgres

make dev-back   # run NestJS dev

dev-install     # run npm install

🔹 clean

Delete: volumes, PostgreSQL clean.

🔹 reb, ref, rng, rdb

Rebuild of separate service:

reb - backend, ref - frontend, rng - nginx, rdb - PostGress

🔹 prune

Clean dangling images

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
- Example health endpoint: `GET /api/health`
- Frontend fetches data using relative paths (e.g. `/api/health`)
- This allows Nginx to proxy requests in production without changing frontend code

## Tech Stack

### Frontend
- Node.js:      20.x
- npm:          10.x
- React:        18
- Vite:         5.x

### Backend
- Node.js:      20.x
- NestJS:       11.x
- Express:      4.x

### Infrastructure (planned)
- Nginx         1.27
- PostgreSQL    16
- Docker & Docker Compose
