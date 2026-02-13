# ==============================================
# Stage 1: Development (for hot reload)
# ==============================================
FROM node:25-alpine AS development

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]


# ==============================================
# Stage 2: Production (optimized, minimal)
# ==============================================
FROM node:25-alpine AS production

WORKDIR /app

COPY ./package*.json ./

RUN npm ci --include=dev

COPY . .

EXPOSE 5173

RUN npm run build

CMD ["sh", "-c", "cp -r dist/* /usr/share/nginx/html"]

