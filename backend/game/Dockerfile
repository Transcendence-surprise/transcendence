# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:25-alpine AS development

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . .

EXPOSE 3003

CMD ["npm", "run", "start:dev"]


# ==============================================
# Stage 2: Production (optimized, minimal)
# ==============================================
FROM node:25-alpine AS production

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "start:prod"]
