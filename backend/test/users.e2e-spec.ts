import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
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

  it('/api/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/users (GET) returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/api/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/api/users/:login (GET) returns user by login', async () => {
    const login = 'e2e_user_login';
    const email = 'e2e_user_login@example.com';

    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE login = $1', [login]);
      await client.query(
        'INSERT INTO users (login, email) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [login, email],
      );
    } finally {
      await client.end();
    }

    const res = await request(app.getHttpServer())
      .get(`/api/users/${login}`)
      .expect(200);

    expect(res.body).toMatchObject({ login, email });
  });

  it('/api/users/:login (GET) returns 404 when not found', async () => {
    await request(app.getHttpServer()).get('/api/users/no_such_user').expect(404);
  });

  it('/api/users/:login (DELETE) deletes user by login', async () => {
    const login = 'e2e_user_delete';
    const email = 'e2e_user_delete@example.com';

    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE login = $1', [login]);
      await client.query(
        'INSERT INTO users (login, email) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [login, email],
      );
    } finally {
      await client.end();
    }

    await request(app.getHttpServer())
      .delete(`/api/users/${login}`)
      .expect(200)
      .expect({ deleted: true, login });

    await request(app.getHttpServer()).get(`/api/users/${login}`).expect(404);
  });

  it('/api/users/:login (DELETE) returns 404 when not found', async () => {
    await request(app.getHttpServer())
      .delete('/api/users/no_such_user_delete')
      .expect(404);
  });
});


