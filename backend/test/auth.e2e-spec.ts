/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { JwtModule, JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

describe('Auth & Protected Routes (e2e)', () => {
  let app: NestFastifyApplication;
  let jwtService: JwtService;
  let testUserId: number;
  const testUsername = 'e2e_auth_test_user';
  const testEmail = 'e2e_auth@example.com';
  const testPassword = 'plainPassword123';
  const jwtSecret = 'test-jwt-secret-key';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(JwtModule)
      .useModule(
        JwtModule.register({
          global: true,
          secret: jwtSecret,
          signOptions: { expiresIn: '24h' },
        }),
      )
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Hash the password for database insertion
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Create test user
    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE username = $1', [
        testUsername,
      ]);
      const result = await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
        [testUsername, testEmail, hashedPassword],
      );
      testUserId = result.rows[0].id;
    } finally {
      await client.end();
    }
  });

  afterAll(async () => {
    // Cleanup
    const client = new Client({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'transcendence',
      password: process.env.DB_PASSWORD ?? 'transcendence',
      database: process.env.DB_NAME ?? 'transcendence',
    });
    await client.connect();
    try {
      await client.query('DELETE FROM users WHERE username = $1', [
        testUsername,
      ]);
    } finally {
      await client.end();
    }

    await app.close();
  });

  describe('Protected Routes', () => {
    it('should deny access without token', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId}`)
        .expect(401);
    });

    it('should deny access with invalid token', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId}`)
        .set('Authorization', 'Bearer invalidToken123')
        .expect(401);
    });

    it('should allow access with valid token', async () => {
      const token = await jwtService.signAsync({
        sub: testUserId,
        username: testUsername,
      });

      const res = await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: testUserId,
        username: testUsername,
        email: testEmail,
      });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should deny access when user tries to access another user data', async () => {
      const token = await jwtService.signAsync({
        sub: testUserId,
        username: testUsername,
      });

      await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId + 1}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('should deny access with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId}`)
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should deny access with expired token', async () => {
      const expiredToken = await jwtService.signAsync(
        {
          sub: testUserId,
          username: testUsername,
        },
        { expiresIn: '0s' },
      );

      // Wait a tiny bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      await request(app.getHttpServer())
        .get(`/api/users/id/${testUserId}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Validate Credentials Endpoint', () => {
    it('should validate correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/validate-credentials')
        .send({
          identifier: testUsername,
          password: testPassword, // Use the plain password
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: testUserId,
        username: testUsername,
        email: testEmail,
      });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should reject invalid username', async () => {
      await request(app.getHttpServer())
        .post('/api/users/validate-credentials')
        .send({
          identifier: 'nonexistent',
          password: 'password',
        })
        .expect(401);
    });

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/users/validate-credentials')
        .send({
          identifier: testUsername,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
