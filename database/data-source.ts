import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { User } from '../backend/src/users/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'transcendence',
  password: process.env.DB_PASSWORD ?? 'transcendence',
  database: process.env.DB_NAME ?? 'transcendence',
  entities: [User],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
