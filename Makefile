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

# Restart containers
dev-restart: down dev

# Build and start dev using base + dev compose files + database migration
dev-build:
	@echo "$(CYAN)Building dev stack...$(RESET)"
	make pack-deps
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
	make pack-deps
	cd database && npm install
	cd frontend && npm install
	cd backend/core && npm install
	cd backend/auth && npm install
	cd backend/gateway && npm install
	cd backend/game && npm install

# Clean Install for CI/CD
dev-ci:
	@echo "$(CYAN)Installing dependencies...$(RESET)"
	make pack-deps
	cd database && npm ci
	cd frontend && npm ci
	cd backend/core && npm ci
	cd backend/auth && npm ci
	cd backend/gateway && npm ci
	cd backend/game && npm ci

# Generate client to communicate Backend
ts-client:
	cd backend/gateway && \
	npm run generate:ts-client

# Pack and distribute dependencies
pack-deps:
	@./common/pack-transcendence-deps.sh

# =========== Rebuild commands ===========

# Build specific service
build-%:
	$(COMPOSE) -f docker-compose.dev.yml up -d --build $*

# For autocomplete
build-db:
build-nginx:
build-core:
build-gateway:
build-game:
build-auth:

# =========== Test commands ===========

# Run frontend and backend tests
test: test-back test-front

# Run backend test
test-back:
	@echo "$(MAGENTA)\n== core tests ==$(RESET)"
	@cd backend/core && npm run test --silent

	@echo "$(MAGENTA)\n== auth tests ==$(RESET)"
	@cd backend/auth && npm run test --silent

	@echo "$(MAGENTA)\n== gateway tests ==$(RESET)"
	@cd backend/gateway && npm run test --silent

	@echo "$(MAGENTA)\n== game tests ==$(RESET)"
	@cd backend/game && npm run test --silent

# Run frontend test
test-front:
	@echo "$(MAGENTA)\n== Frontend tests ==$(RESET)"
	@cd frontend && npm run test --silent

# =========== Clean commands ===========

# Stop and remove containers, network (keep volumes)
clean:
	@echo "$(CYAN)Stopping containers...$(RESET)"
	$(COMPOSE) down

# Stop and remove everything (volumes too)
fclean:
	@echo "$(CYAN)Stopping containers and removing volumes...$(RESET)"
	$(COMPOSE) -f docker-compose.dev.yml down -v

prune: fclean
	@echo "$(CYAN)Pruning dangling images...$(RESET)"
	docker system prune -af

# Stop and remove prod DB volumes (full reset of prod DB)
prod-fclean:
	@echo "$(CYAN)Stopping prod containers and removing prod volumes...$(RESET)"
	$(COMPOSE) -f docker-compose.prod.yml down -v

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
log-gateway:
log-game:
log-auth:

# Show running containers
ps:
	$(COMPOSE) ps

.PHONY: \
	up down dev dev-build dev-db dev-down dev-clean dev-fclean dev-prune \
	dev-front dev-back dev-migrate dev-seed dev-install dev-ci clean fclean \
	re logs ps \
	dev-build prune prod test test-back test-front ts-client \
