// Ensure required env vars for tests
process.env.GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3002';
process.env.CORE_URL = process.env.CORE_URL || 'http://localhost:3001';
process.env.INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'test-internal-key';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('game/health (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/api/game/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
