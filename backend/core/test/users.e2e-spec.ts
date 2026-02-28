import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    // Set required mail env vars for testing
    process.env.MAIL_HOST = 'localhost';
    process.env.MAIL_PORT = '1025';
    process.env.MAIL_SECURE = 'false';
    process.env.MAIL_USER = 'test';
    process.env.MAIL_PASSWORD = 'test';
    process.env.MAIL_FROM_ADDRESS = 'test@example.com';

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
      .get('/core/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/users (GET) returns an array', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
