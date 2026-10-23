import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateVehicleData,
  IVehicleRepository,
  PaginatedResult,
  SearchVehicleFilters,
  UpdateVehicleData,
  VEHICLES_REPOSITORY,
} from './interfaces/vehicles-repository.interface';
import { Vehicle } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLES_REPOSITORY)
    private readonly vehiclesRepository: IVehicleRepository,
  ) {}

  async create(data: CreateVehicleData): Promise<Vehicle> {
    return this.vehiclesRepository.create(data);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Vehicle>> {
    return this.vehiclesRepository.findAll(pagination);
  }

  async search(
    filters: SearchVehicleFilters,
  ): Promise<PaginatedResult<Vehicle>> {
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }

    return this.vehiclesRepository.search(filters);
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" was not found`);
    }
    return vehicle;
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    // Ensure existence before attempting update
    await this.findById(id);
    return this.vehiclesRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Ensure existence before attempting deletion
    await this.findById(id);
    await this.vehiclesRepository.delete(id);
  }
}
