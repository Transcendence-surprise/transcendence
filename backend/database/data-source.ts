import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

import { Game } from './game/game.entity';
import { GamePlayer } from './game/game-player.entity';
import { User } from './users/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'transcendence',
  password: process.env.POSTGRES_PASSWORD ?? 'transcendence',
  database: process.env.POSTGRES_DB ?? 'transcendence',
  entities: [User, Game, GamePlayer],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
