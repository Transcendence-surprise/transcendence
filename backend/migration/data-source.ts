import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { ApiKey, Game, GamePlayer, User } from '@transcendence/db-entities';

if (!(process.env.POSTGRES_HOST &&
    Number(process.env.POSTGRES_PORT) &&
    process.env.POSTGRES_USER &&
    process.env.POSTGRES_PASSWORD &&
    process.env.POSTGRES_DB))
{
      console.log('Error: some env variables not set');
      process.exit(1);
}

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [ApiKey, User, Game, GamePlayer],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
});
