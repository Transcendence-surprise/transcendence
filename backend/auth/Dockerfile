# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:20-alpine AS development

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth/package*.json ./backend/auth/

RUN cd common/packages/db-entities && npm install && npm run build
RUN cd backend/auth && npm ci

COPY backend/auth ./backend/auth

WORKDIR /app/backend/auth

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


# ==============================================
# Stage 2: Builder (compile TypeScript)
# ==============================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth/package*.json ./backend/auth/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix backend/auth --legacy-peer-deps

COPY backend/auth ./backend/auth

WORKDIR /app/backend/auth

RUN npm run build


# ==============================================
# Stage 3: Production (optimized, minimal)
# ==============================================
FROM node:20-alpine AS production

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/auth/package*.json ./backend/auth/

RUN npm ci --prefix common/packages/db-entities --legacy-peer-deps \
  && npm --prefix common/packages/db-entities run build

RUN npm ci --prefix backend/auth --omit=dev --legacy-peer-deps

COPY --from=builder --chown=node:node /app/backend/auth/dist ./backend/auth/dist

WORKDIR /app/backend/auth

EXPOSE 3001

CMD ["node", "dist/main.js"]
