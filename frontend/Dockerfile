# ---------- Build Stage ----------
FROM node:20.11.1-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "run", "build"]

# Output: /app/dist
