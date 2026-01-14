# -----------------------------------
# ft_transcendence Makefile
# -----------------------------------
# -------- Colors --------

RED     = \033[31m
GREEN   = \033[32m
YELLOW  = \033[33m
BLUE    = \033[34m
MAGENTA = \033[35m
CYAN    = \033[36m
WHITE   = \033[37m
RESET = \033[0m

# -------- Variables --------
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

# =========== Backend commands ===========
# Start dev DB only
dev-db:
	@echo "$(CYAN)Starting PostgreSQL...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml up -d db
	
# Run migrations (dev DB must be up)
dev-migrate:
	@echo "$(CYAN)Running migrations...$(RESET)"
	cd backend && npm run migration:run

# Seed dev DB with a couple of users (safe to run multiple times)
dev-seed:
	@echo "$(CYAN)Seeding users table...$(RESET)"
	docker exec -i postgres_dev psql -U transcendence -d transcendence < database/init/01-seed-users.sql

# Backend dev server
dev-back-serv:
	@echo "$(CYAN)Starting backend...$(RESET)"
	@echo "$(YELLOW)Running in foreground. Stop with Ctrl+C.$(RESET)"
	cd backend && npm run start:dev

# Start all backend services at once
dev-back: 
	make dev-db
	make dev-migrate
	make dev-seed
	make dev-back-serv
# Stop containers (keep volumes)
dev-clean:
	@echo "$(CYAN)Stopping containers...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml down

# Stop and remove dev DB volumes (full reset of dev DB)
dev-fclean:
	@echo "$(CYAN)Stopping dev containers and removing dev volumes...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml down -v

# Prune dangling images (full reset of dev stack)
dev-prune: dev-fclean
	@echo "$(CYAN)Pruning dangling images...$(RESET)"
	docker system prune -af

# Install dependencies
dev-install:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	cd frontend && npm install
	cd backend && npm install

# Stop containers (keep volumes)
clean:
	@echo "$(CYAN)Stopping containers...$(RESET)"
	$(COMPOSE) down

# Stop and remove everything (volumes too)
fclean:
	@echo "$(CYAN)Stopping containers and removing volumes...$(RESET)"
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

prune: fclean
	@echo "$(CYAN)Pruning dangling images...$(RESET)"
	docker system prune -af

.PHONY: up down dev dev-db dev-down dev-clean dev-fclean dev-prune dev-front dev-back dev-migrate dev-seed dev-install clean fclean re logs ps reb ref rng rdb prune prod
