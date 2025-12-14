# -----------------------------------
# ft_transcendence Makefile
# -----------------------------------

COMPOSE = docker compose
PROJECT = transcendence

# Start prod
prod:
	$(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Start full stack
up:
	$(COMPOSE) up --build -d

# Stop containers (keep volumes)
down:
	$(COMPOSE) down

dev:
	$(COMPOSE) -f docker-compose.dev.yml up -d

# Stop DB
dev-down:
	$(COMPOSE) -f docker-compose.dev.yml down

# Frontend dev server
dev-front:
	cd frontend && npm run dev

# Backend dev server
dev-back:
	cd backend && npm run start:dev

dev-install:
	cd frontend && npm install
	cd backend && npm install

# Stop and remove everything (volumes too)
clean:
	$(COMPOSE) down -v

# Rebuild from scratch
re: clean up

# View logs
logs:
	$(COMPOSE) logs -f

# Show running containers
ps:
	$(COMPOSE) ps

# Restart backend ONLY
reb:
	$(COMPOSE) up --build -d backend

# Restart frontend ONLY
ref:
	$(COMPOSE) up --build -d frontend

# Restart nginx ONLY
rng:
	$(COMPOSE) up --build -d nginx

# Restart database ONLY
rdb:
	$(COMPOSE) up --build -d db

prune:
	docker system prune -af

.PHONY: up down clean re logs ps reb ref rng rdb
