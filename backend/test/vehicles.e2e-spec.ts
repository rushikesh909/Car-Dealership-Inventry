import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestAppSetup } from './test-utils';
import { Role } from '../src/common/enums/role.enum';

describe('Vehicles Endpoints (e2e)', () => {
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
    const user = await setup.createTestUser('normal@test.com', Role.USER);
    userToken = user.token;
    const admin = await setup.createTestUser('admin@test.com', Role.ADMIN);
    adminToken = admin.token;
  });

  afterAll(async () => {
    await setup.cleanDatabase();
    await setup.prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/vehicles', () => {
    it('should reject unauthenticated request (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/vehicles')
        .send({
          make: 'Toyota',
          model: 'Corolla',
          category: 'Sedan',
          price: 22000,
          quantity: 3,
        })
        .expect(401);
    });

    it('should create vehicle when authenticated (201)', async () => {
      const payload = {
        make: 'Tesla',
        model: 'Model 3',
        category: 'Sedan',
        price: 38990.0,
        quantity: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.make).toBe('Tesla');
      expect(response.body.model).toBe('Model 3');
      expect(Number(response.body.price)).toBe(38990.0);
      expect(response.body.quantity).toBe(5);
    });

    it('should reject invalid payload (price <= 0 or quantity < 0) (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          category: 'Sedan',
          price: -100, // Invalid price
          quantity: 5,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Tesla',
          model: 'Model 3',
          category: 'Sedan',
          price: 35000,
          quantity: -2, // Invalid quantity
        })
        .expect(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should reject unauthenticated request (401)', async () => {
      await request(app.getHttpServer()).get('/api/vehicles').expect(401);
    });

    it('should return paginated vehicle list when authenticated (200)', async () => {
      // Seed 2 vehicles
      await setup.prisma.vehicle.createMany({
        data: [
          {
            make: 'BMW',
            model: '330i',
            category: 'Sedan',
            price: 43000,
            quantity: 2,
          },
          {
            make: 'Audi',
            model: 'A4',
            category: 'Sedan',
            price: 41000,
            quantity: 4,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/vehicles?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.total).toBe(2);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await setup.prisma.vehicle.createMany({
        data: [
          {
            make: 'Toyota',
            model: 'RAV4',
            category: 'SUV',
            price: 29000,
            quantity: 3,
          },
          {
            make: 'Toyota',
            model: 'Camry',
            category: 'Sedan',
            price: 26000,
            quantity: 5,
          },
          {
            make: 'Ford',
            model: 'Explorer',
            category: 'SUV',
            price: 37000,
            quantity: 2,
          },
        ],
      });
    });

    it('should filter by make and category (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/search?make=toyota&category=suv')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].model).toBe('RAV4');
    });

    it('should filter by price range (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/search?minPrice=25000&maxPrice=30000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
    });

    it('should reject invalid price range where minPrice > maxPrice (400)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/vehicles/search?minPrice=50000&maxPrice=20000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.message).toContain(
        'minPrice cannot be greater than maxPrice',
      );
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should update vehicle details with valid payload (200)', async () => {
      const created = await setup.prisma.vehicle.create({
        data: {
          make: 'Nissan',
          model: 'Altima',
          category: 'Sedan',
          price: 25000,
          quantity: 4,
        },
      });

      const response = await request(app.getHttpServer())
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 26500.0, model: 'Altima SV' })
        .expect(200);

      expect(Number(response.body.price)).toBe(26500.0);
      expect(response.body.model).toBe('Altima SV');
    });

    it('should return 404 if vehicle does not exist', async () => {
      const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .put(`/api/vehicles/${nonExistentUuid}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 30000 })
        .expect(404);
    });
  });

  describe('DELETE /api/vehicles/:id (ADMIN Only)', () => {
    it('should forbid regular USER from deleting vehicle (403)', async () => {
      const created = await setup.prisma.vehicle.create({
        data: {
          make: 'Chevy',
          model: 'Malibu',
          category: 'Sedan',
          price: 24000,
          quantity: 1,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow ADMIN to delete vehicle (204)', async () => {
      const created = await setup.prisma.vehicle.create({
        data: {
          make: 'Chevy',
          model: 'Malibu',
          category: 'Sedan',
          price: 24000,
          quantity: 1,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const check = await setup.prisma.vehicle.findUnique({
        where: { id: created.id },
      });
      expect(check).toBeNull();
    });

    it('should return 404 for ADMIN if vehicle does not exist', async () => {
      const nonExistentUuid = 'a0000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/api/vehicles/${nonExistentUuid}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
