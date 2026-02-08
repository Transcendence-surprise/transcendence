FROM node:25-alpine

WORKDIR /app

COPY common/packages/db-entities ./common/packages/db-entities
COPY backend/package*.json ./backend/

RUN cd common/packages/db-entities && npm install && npm run build
RUN cd backend && npm ci

COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
