import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestAppSetup } from './test-utils';

describe('Auth Endpoints (e2e)', () => {
  let setup: TestAppSetup;
  let app: INestApplication;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
  });

  beforeEach(async () => {
    await setup.cleanDatabase();
  });

  afterAll(async () => {
    await setup.cleanDatabase();
    await setup.prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully (201)', async () => {
      const payload = {
        email: 'alice@dealership.com',
        password: 'ValidPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
      expect(response.body.role).toBe('USER');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should reject invalid email or weak password (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'short',
        })
        .expect(400);
    });

    it('should reject registration if email is already taken (409)', async () => {
      const payload = {
        email: 'duplicate@dealership.com',
        password: 'ValidPassword123!',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      // Duplicate registration attempt
      const conflictRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(409);

      expect(conflictRes.body.message).toContain('already exists');
    });

    it('should ignore any supplied role property and always enforce USER role', async () => {
      const payload = {
        email: 'hacker@dealership.com',
        password: 'ValidPassword123!',
        role: 'ADMIN', // Non-whitelisted property should be rejected by forbidNonWhitelisted
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Direct database user creation via helper
      await setup.createTestUser('loginuser@dealership.com', 'USER' as any);
    });

    it('should log in successfully with correct credentials (200)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'loginuser@dealership.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe('loginuser@dealership.com');
      expect(response.body.user.role).toBe('USER');
    });

    it('should reject non-existent user with generic 401 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@dealership.com',
          password: 'SecurePassword123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject wrong password with generic 401 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'loginuser@dealership.com',
          password: 'WrongPassword999!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
