FROM node:25-alpine

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/core/package*.json ./backend/core/

RUN cd common/packages/db-entities && npm install && npm run build
RUN cd backend/core && npm ci

COPY backend/core ./backend/core

WORKDIR /app/backend/core
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
