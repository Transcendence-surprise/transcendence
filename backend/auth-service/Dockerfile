# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:20-alpine AS development

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth-service/package*.json ./backend/auth-service/

RUN cd common/packages/db-entities && npm install && npm run build
RUN cd backend/auth-service && npm ci

COPY backend/auth-service ./backend/auth-service

WORKDIR /app/backend/auth-service

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


# ==============================================
# Stage 2: Builder (compile TypeScript)
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth-service/package*.json ./backend/auth-service/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix backend/auth-service --legacy-peer-deps

COPY backend/auth-service ./backend/auth-service

WORKDIR /app/backend/auth-service

RUN npm run build


# ==============================================
# Stage 3: Production (optimized, minimal)
# ==============================================
FROM node:20-alpine AS production

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth-service/package*.json ./backend/auth-service/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix backend/auth-service --omit=dev --legacy-peer-deps

COPY --from=builder --chown=node:node /app/backend/auth-service/dist ./backend/auth-service/dist

WORKDIR /app/backend/auth-service

EXPOSE 3001

CMD ["node", "dist/main.js"]
