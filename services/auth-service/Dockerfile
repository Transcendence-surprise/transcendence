# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:20-alpine AS development

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY services/auth-service/package*.json ./services/auth-service/

RUN cd common/packages/db-entities && npm install && npm run build
RUN cd services/auth-service && npm ci

COPY services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


# ==============================================
# Stage 2: Builder (compile TypeScript)
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY services/auth-service/package*.json ./services/auth-service/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix services/auth-service --legacy-peer-deps

COPY services/auth-service ./services/auth-service

WORKDIR /app/services/auth-service

RUN npm run build


# ==============================================
# Stage 3: Production (optimized, minimal)
# ==============================================
FROM node:20-alpine AS production

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY services/auth-service/package*.json ./services/auth-service/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix services/auth-service --omit=dev --legacy-peer-deps

COPY --from=builder --chown=node:node /app/services/auth-service/dist ./services/auth-service/dist

WORKDIR /app/services/auth-service

EXPOSE 3001

CMD ["node", "dist/main.js"]
