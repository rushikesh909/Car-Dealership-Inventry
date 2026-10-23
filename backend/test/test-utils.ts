import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres@127.0.0.1:5434/cardealership_test?schema=public';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-characters-long';
}
if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '1d';
}

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/common/enums/role.enum';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

export interface TestAppSetup {
  app: INestApplication;
  prisma: PrismaService;
  jwtService: JwtService;
  createTestUser: (
    email?: string,
    role?: Role,
  ) => Promise<{ token: string; user: any }>;
  cleanDatabase: () => Promise<void>;
}

export async function createTestApp(
  disableThrottling = true,
): Promise<TestAppSetup> {
  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (disableThrottling) {
    moduleBuilder
      .overrideProvider(APP_GUARD)
      .useValue({ canActivate: () => true });
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  const prisma = app.get(PrismaService);
  const jwtService = app.get(JwtService);

  const cleanDatabase = async () => {
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});
  };

  const createTestUser = async (
    email = `user-${Date.now()}-${Math.random()}@test.com`,
    role = Role.USER,
  ) => {
    const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as any,
      },
    });

    const token = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  };

  return {
    app,
    prisma,
    jwtService,
    createTestUser,
    cleanDatabase,
  };
}
