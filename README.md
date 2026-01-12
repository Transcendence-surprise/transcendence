# Transcendence

## Makefile
Development

### Development

**Frontend:**

NOTE: find all backend dev documentaion at:
```bash
/docs/BACKEND-DEV.md
```

**Step 1:** After cloning the repo run at the first time:
```bash
make dev-install
```

**Step 2:** Start dev DB, run migrations, start NestJS dev
```bash
make dev-back
```

**Step 3:** After starting backend run server health check:
```bash
curl -i http://localhost:3000/api/health # should retun 200
```

## API 
Read API_DOCS.md:
```bash
/docs/API_DOCS.md
```

## Database
Read DATABESE-DEV.md to communicate with database directly:
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
- **Node.js:**      20.x
- **npm:**          10.x
- **React:**        18
- **Vite:**         5.x

### Backend
- **Node.js:**      20.x
- **NestJS:**       11.x
- **Express:**      4.x

### Infrastructure (planned)
- **Nginx:**        1.27
- **PostgreSQL:**   16
- **Docker & Docker Compose**
