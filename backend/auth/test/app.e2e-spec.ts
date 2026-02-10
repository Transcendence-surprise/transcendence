import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
dotenv.config({ path: resolve(__dirname, '..', '..', '..', '.env') });

// Override database env vars for test environment
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'transcendence';
process.env.POSTGRES_PASSWORD = 'transcendence';
process.env.POSTGRES_DB = 'transcendence';

describe('Auth Service (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }, 30000); // 30s timeout for DB connection

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('auth/health (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/api/auth/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
