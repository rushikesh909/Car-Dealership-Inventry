import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestAppSetup } from './test-utils';
import { Role } from '../src/common/enums/role.enum';

describe('Inventory Endpoints (e2e)', () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
  });

  beforeEach(async () => {
    await setup.cleanDatabase();
    const user = await setup.createTestUser('buyer@test.com', Role.USER);
    userToken = user.token;
    const admin = await setup.createTestUser('admin-mgr@test.com', Role.ADMIN);
    adminToken = admin.token;
  });

  afterAll(async () => {
    await setup.cleanDatabase();
    await setup.prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should reject unauthenticated purchase request (401)', async () => {
      const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post(`/api/vehicles/${nonExistentUuid}/purchase`)
        .expect(401);
    });

    it('should return 404 when vehicle ID does not exist', async () => {
      const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post(`/api/vehicles/${nonExistentUuid}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should successfully decrement vehicle quantity by 1 (200)', async () => {
      const vehicle = await setup.prisma.vehicle.create({
        data: {
          make: 'Mazda',
          model: 'CX-5',
          category: 'SUV',
          price: 29500,
          quantity: 2,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.quantity).toBe(1);

      const check = await setup.prisma.vehicle.findUnique({
        where: { id: vehicle.id },
      });
      expect(check?.quantity).toBe(1);
    });

    it('should return 409 Conflict when vehicle is out of stock (quantity is 0)', async () => {
      const outOfStockVehicle = await setup.prisma.vehicle.create({
        data: {
          make: 'Mazda',
          model: 'MX-5 Miata',
          category: 'Convertible',
          price: 28000,
          quantity: 0,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/vehicles/${outOfStockVehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(409);

      expect(response.body.message).toContain('out of stock');
    });
  });

  describe('POST /api/vehicles/:id/restock (ADMIN Only)', () => {
    it('should forbid regular USER from restocking vehicle (403)', async () => {
      const vehicle = await setup.prisma.vehicle.create({
        data: {
          make: 'Subaru',
          model: 'Outback',
          category: 'Wagon',
          price: 28500,
          quantity: 1,
        },
      });

      await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 5 })
        .expect(403);
    });

    it('should allow ADMIN to restock vehicle and increment quantity (200)', async () => {
      const vehicle = await setup.prisma.vehicle.create({
        data: {
          make: 'Subaru',
          model: 'Outback',
          category: 'Wagon',
          price: 28500,
          quantity: 2,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 10 })
        .expect(200);

      expect(response.body.quantity).toBe(12);

      const check = await setup.prisma.vehicle.findUnique({
        where: { id: vehicle.id },
      });
      expect(check?.quantity).toBe(12);
    });

    it('should reject non-positive or invalid restock amount (400)', async () => {
      const vehicle = await setup.prisma.vehicle.create({
        data: {
          make: 'Subaru',
          model: 'Crosstrek',
          category: 'SUV',
          price: 24500,
          quantity: 2,
        },
      });

      await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 0 })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: -3 })
        .expect(400);
    });

    it('should return 404 for ADMIN if vehicle does not exist to restock', async () => {
      const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post(`/api/vehicles/${nonExistentUuid}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5 })
        .expect(404);
    });
  });
});
