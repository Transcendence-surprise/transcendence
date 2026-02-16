import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { ApiKey, Game, GamePlayer, User } from '@transcendence/db-entities';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'transcendence',
  password: process.env.POSTGRES_PASSWORD ?? 'transcendence',
  database: process.env.POSTGRES_DB ?? 'transcendence',
  entities: [ApiKey, User, Game, GamePlayer],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
});
