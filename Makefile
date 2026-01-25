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

# =========== Prod commands ===========

# Start prod
prod:
	$(COMPOSE) -f docker-compose.prod.yml up -d --build

# =========== Build commands ===========

# Run containers
dev:
	$(COMPOSE) -f docker-compose.dev.yml up -d

# Stop containers (keep volumes)
down:
	$(COMPOSE) down

# Build and start dev using base + dev compose files + database migration
dev-build:
	@echo "$(CYAN)Building dev stack...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml up -d --build

# Run migrations (dev DB must be up)
dev-migrate:
	@echo "$(CYAN)Running migrations...$(RESET)"
	@i=0; \
	while ! $(COMPOSE) -f docker-compose.dev.yml exec -T backend npm run migration:run >/dev/null 2>&1; do \
		i=$$((i+1)); \
		if [ $$i -ge 10 ]; then \
			echo "$(RED)Migrations failed after retries.$(RESET)"; \
			exit 1; \
		fi; \
		sleep 2; \
	done
	@echo "$(GREEN)Migrations successful.$(RESET)";

# Seed dev DB with a couple of users (safe to run multiple times)
dev-seed:
	@echo "$(CYAN)Seeding users table...$(RESET)"
	docker exec -i postgres-dev psql -U transcendence -d transcendence < database/init/01-seed-users.sql

# Start dev DB only
dev-db:
	@echo "$(CYAN)Starting PostgreSQL...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml up -d db

# Frontend dev server (local)
dev-front:
	cd frontend && npm run dev

# Install dependencies for tests (Legacy for dev: Containers install dependencies)
dev-install:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	cd frontend && npm install
	cd backend && npm install
	cd auth-service && npm install
	cd api-gateway && npm install

# =========== Rebuild commands ===========

# Rebuild shortcuts
build-db:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build db

build-nginx:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build nginx

build-backend:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build backend

build-frontend:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build frontend

build-auth-service:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build auth-service

build-api-gateway:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build api-gateway

# =========== Test commands ===========

# Run frontend and backend tests
test-all: test-back test-front

# Run backend test
test-back:
	@echo "$(MAGENTA)\n== Backend tests ==$(RESET)"
	@cd backend && npm run test --silent

	@echo "$(MAGENTA)\n== Auth-service tests ==$(RESET)"
	@cd services/auth-service && npm run test --silent

	@echo "$(MAGENTA)\n== Api-gateway tests ==$(RESET)"
	@cd services/api-gateway && npm run test --silent

# Run frontend test
test-front:
	@echo "$(MAGENTA)\n== Frontend tests ==$(RESET)"
	@cd frontend && npm run test --silent

# =========== Clean commands ===========

# Stop containers (keep volumes)
clean:
	@echo "$(CYAN)Stopping containers...$(RESET)"
	$(COMPOSE) down

# Stop and remove everything (volumes too)
fclean:
	@echo "$(CYAN)Stopping containers and removing volumes...$(RESET)"
	$(COMPOSE) down -v

prune: fclean
	@echo "$(CYAN)Pruning dangling images...$(RESET)"
	docker system prune -af

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

# =========== Utility commands ===========

# View logs
logs:
	$(COMPOSE) logs -f

# Show running containers
ps:
	$(COMPOSE) ps

.PHONY: \
	up down dev dev-build dev-db dev-down dev-clean dev-fclean dev-prune \
	dev-front dev-back dev-migrate dev-seed dev-install clean fclean \
	re logs ps rebuild-db rebuild-nginx rebuild-backend rebuild-frontend \
	rebuild-auth-service rebuild-api-gateway dev-rebuild prune prod
