import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateVehicleData,
  IVehicleRepository,
  PaginatedResult,
  SearchVehicleFilters,
  UpdateVehicleData,
} from '../interfaces/vehicles-repository.interface';
import { Prisma, Vehicle } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class PrismaVehiclesRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVehicleData): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        category: data.category,
        price: new Prisma.Decimal(data.price),
        quantity: data.quantity,
      },
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Vehicle>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.vehicle.count(),
      this.prisma.vehicle.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async search(
    filters: SearchVehicleFilters,
  ): Promise<PaginatedResult<Vehicle>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (filters.make) {
      where.make = { contains: filters.make.trim(), mode: 'insensitive' };
    }
    if (filters.model) {
      where.model = { contains: filters.model.trim(), mode: 'insensitive' };
    }
    if (filters.category) {
      where.category = {
        contains: filters.category.trim(),
        mode: 'insensitive',
      };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.vehicle.count({ where }),
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const updateData: Prisma.VehicleUpdateInput = {};
    if (data.make !== undefined) updateData.make = data.make;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined)
      updateData.price = new Prisma.Decimal(data.price);
    if (data.quantity !== undefined) updateData.quantity = data.quantity;

    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
