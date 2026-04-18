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

Copy the template to your home directory and fill in real values for all `SECRET` fields (mail credentials, OAuth keys, JWT secret, etc.):

```bash
cp .env.example ~/transcendence-secrets.env
# Edit ~/transcendence-secrets.env with your real values
```

Keep this file **outside the project** — it is never committed.

### Step 3 — Start Vault and seed your secrets

```bash
make vault-init                                   # start the Vault container
make vault-seed FILE=~/transcendence-secrets.env  # import secrets into Vault
```

Vault runs in **dev mode**: data is in-memory, accessible at http://localhost:8200/ui with token `dev-root-token`.

### Step 4 — Build and start the dev stack

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

### Stop Vault survives `make down`

`make down` do not stop vault container, it keeps running — and its in-memory secrets are preserved — across normal restarts.

After running `make down` command you may see:
```bash
! Network transcendence_transcendence_net Resource is still in use     
```
It means Vault is running and using the network (no need to seed Vault with secrets for starting app)

If you need to stop Vault run:

```bash
make vault-stop
```

### After a Vault restart (secrets are lost on container restart)

Re-seed before starting the stack:

```bash
make vault-seed FILE=~/transcendence-secrets.env
make dev
```

### Stop and start

```bash
make down       # stop containers, keep volumes
make restart    # stop + start (no rebuild)
```

---

## Vault

For Vault UI usage, editing secrets, and full details see `docs/VAULT-GUIDE.md`.

---

## Without Vault

If Vault is not running (no `VAULT_TOKEN` env var set), backend services fall back to a `.env` file in the project root — the old workflow still works.

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

### Vault

| Command | Description |
|---------|-------------|
| `make vault-init` | Start Vault container (dev mode) |
| `make vault-seed FILE=<path>` | Import secrets from a file into Vault |
| `make vault-stop` | Stop Vault container |
| `make dev-vault [FILE=<path>]` | Start Vault, optionally seed, start dev stack |

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
make logs          # all services
make log-core      # single service (log-auth, log-gateway, log-game, log-nginx, log-db, log-vault)
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
| Vault UI | http://localhost:8200/ui (token: `dev-root-token`) |

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
- HashiCorp Vault (dev secrets)
- Hetzner VPS
