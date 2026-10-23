import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VEHICLES_REPOSITORY } from './interfaces/vehicles-repository.interface';
import { PrismaVehiclesRepository } from './repositories/prisma-vehicles.repository';

@Module({
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    {
      provide: VEHICLES_REPOSITORY,
      useClass: PrismaVehiclesRepository,
    },
  ],
  exports: [VehiclesService, VEHICLES_REPOSITORY],
})
export class VehiclesModule {}
