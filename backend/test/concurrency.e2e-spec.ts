import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, TestAppSetup } from './test-utils';
import { Role } from '../src/common/enums/role.enum';

describe('Inventory Concurrency & Race-Safety Test (e2e)', () => {
  let setup: TestAppSetup;
  let app: INestApplication;
  let buyerToken: string;

  beforeAll(async () => {
    setup = await createTestApp();
    app = setup.app;
  });

  beforeEach(async () => {
    await setup.cleanDatabase();
    const buyer = await setup.createTestUser(
      'concurrent-buyer@test.com',
      Role.USER,
    );
    buyerToken = buyer.token;
  });

  afterAll(async () => {
    await setup.cleanDatabase();
    await setup.prisma.$disconnect();
    await app.close();
  });

  it('should handle simultaneous concurrent purchases safely without overselling below 0', async () => {
    const initialStock = 3;
    const totalConcurrentRequests = 10;

    // Create a vehicle with strictly 3 units in stock
    const limitedVehicle = await setup.prisma.vehicle.create({
      data: {
        make: 'Porsche',
        model: '911 GT3 RS',
        category: 'Coupe',
        price: 223800.0,
        quantity: initialStock,
      },
    });

    // Fire 10 parallel requests concurrently via Promise.all
    const purchaseRequests = Array.from({
      length: totalConcurrentRequests,
    }).map(() =>
      request(app.getHttpServer())
        .post(`/api/vehicles/${limitedVehicle.id}/purchase`)
        .set('Authorization', `Bearer ${buyerToken}`),
    );

    const responses = await Promise.all(purchaseRequests);

    const successfulPurchases = responses.filter((res) => res.status === 200);
    const rejectedOutOfStock = responses.filter((res) => res.status === 409);

    // Exactly initialStock (3) requests should succeed
    expect(successfulPurchases.length).toBe(initialStock);

    // The remaining (7) requests must be rejected with 409 Conflict
    expect(rejectedOutOfStock.length).toBe(
      totalConcurrentRequests - initialStock,
    );

    // Check final database state: quantity must be exactly 0 (never negative)
    const finalVehicleState = await setup.prisma.vehicle.findUnique({
      where: { id: limitedVehicle.id },
    });

    expect(finalVehicleState).not.toBeNull();
    expect(finalVehicleState?.quantity).toBe(0);
  });
});
