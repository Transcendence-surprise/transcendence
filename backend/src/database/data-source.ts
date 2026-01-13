import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'transcendence',
  password: process.env.DB_PASSWORD ?? 'transcendence',
  database: process.env.DB_NAME ?? 'transcendence',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
});