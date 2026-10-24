import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Cleans all database collections between test suites to ensure test isolation and idempotency.
   */
  async cleanDatabase() {
    await this.vehicle.deleteMany({});
    await this.user.deleteMany({});
  }
}
