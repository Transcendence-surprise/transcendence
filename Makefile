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
	while ! $(COMPOSE) -f docker-compose.dev.yml exec -T core npm run migration:run >/dev/null 2>&1; do \
		i=$$((i+1)); \
		if [ $$i -ge 10 ]; then \
			echo "$(RED)Migrations failed after retries.$(RESET)"; \
			exit 1; \
		fi; \
		sleep 2; \
	done
	@echo "$(GREEN)Migrations successful.$(RESET)";

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
	cd common/packages/db-entities && npm install && npm run build
	cd database && npm install
	cd frontend && npm install
	cd backend/core && npm install
	cd backend/auth-service && npm install
	cd backend/api-gateway && npm install
	cd backend/game-service && npm install

# Clean Install for CI/CD
dev-ci:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	cd common/packages/db-entities && npm ci && npm run build
	cd database && npm ci
	cd frontend && npm ci
	cd backend/core && npm ci
	cd backend/auth-service && npm ci
	cd backend/api-gateway && npm ci
	cd backend/game-service && npm ci

ts-client:
	cd backend/api-gateway && \
	npm run generate:ts-client

# =========== Rebuild commands ===========

# Build specific service
build-%:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build $*

# For autocomplete
build-db:
build-nginx:
build-core:
build-api-gateway:
build-game-service:
build-auth-service:

# =========== Test commands ===========

# Run frontend and backend tests
test: test-back test-front

# Run backend test
test-back:
	@echo "$(MAGENTA)\n== Core tests ==$(RESET)"
	@cd backend/core && npm run test --silent

	@echo "$(MAGENTA)\n== Auth-service tests ==$(RESET)"
	@cd backend/auth-service && npm run test --silent

	@echo "$(MAGENTA)\n== Api-gateway tests ==$(RESET)"
	@cd backend/api-gateway && npm run test --silent

	@echo "$(MAGENTA)\n== Game-service tests ==$(RESET)"
	@cd backend/game-service && npm run test --silent

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

# View logs for all services
logs:
	$(COMPOSE) logs -f

# View logs for specific service (e.g., make log-core, make log-nginx)
log-%:
	$(COMPOSE) logs -f $*

# For autocomplete
log-db:
log-nginx:
log-core:
log-api-gateway:
log-game-service:
log-auth-service:

# Show running containers
ps:
	$(COMPOSE) ps

.PHONY: \
	up down dev dev-build dev-db dev-down dev-clean dev-fclean dev-prune \
	dev-front dev-back dev-migrate dev-seed dev-install dev-ci clean fclean \
	re logs ps \
	dev-build prune prod test test-back test-front ts-client \
