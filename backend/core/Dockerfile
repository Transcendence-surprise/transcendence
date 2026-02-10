FROM node:25-alpine

WORKDIR /app

COPY ./transcendence-db-entities-1.0.0.tgz ./
COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
