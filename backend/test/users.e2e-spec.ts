import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Client } from 'pg';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/users (GET) returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/users/:username (GET) returns user by username', async () => {
    const username = 'e2e_user_username';
    const email = 'e2e_user_username@example.com';
    const password =
      '$2b$10$K1wFn0Zr.0Y.L4L8zN5Zj.U0vQ3K4hQ5tQ6K7hQ8tQ9K0hQ1K2hQ3'; // Dummy bcrypt hash

    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE username = $1', [username]);
      await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [username, email, password], // ← Add password
      );
    } finally {
      await client.end();
    }

    const res = await request(app.getHttpServer())
      .get(`/users/${username}`)
      .expect(200);

    expect(res.body).toMatchObject({ username, email });
  });

  it('/users/:username (DELETE) deletes user by username', async () => {
    const username = 'e2e_user_delete';
    const email = 'e2e_user_delete@example.com';
    const password =
      '$2b$10$K1wFn0Zr.0Y.L4L8zN5Zj.U0vQ3K4hQ5tQ6K7hQ8tQ9K0hQ1K2hQ3'; // Dummy bcrypt hash

    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE username = $1', [username]);
      await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [username, email, password], // ← Add password
      );
    } finally {
      await client.end();
    }

    await request(app.getHttpServer())
      .delete(`/users/${username}`)
      .expect(200)
      .expect({ deleted: true, username });

    await request(app.getHttpServer()).get(`/users/${username}`).expect(404);
  });

  it('/users/:username (DELETE) returns 404 when not found', async () => {
    await request(app.getHttpServer())
      .delete('/users/no_such_user_delete')
      .expect(404);
  });
});
