import { Vehicle } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const VEHICLES_REPOSITORY = 'VEHICLES_REPOSITORY';

export interface CreateVehicleData {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateVehicleData {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface SearchVehicleFilters extends PaginationDto {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IVehicleRepository {
  create(data: CreateVehicleData): Promise<Vehicle>;
  findAll(pagination: PaginationDto): Promise<PaginatedResult<Vehicle>>;
  search(filters: SearchVehicleFilters): Promise<PaginatedResult<Vehicle>>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleData): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
