import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IInventoryRepository } from '../interfaces/inventory-repository.interface';
import { Vehicle } from '@prisma/client';

@Injectable()
export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  /**
   * Atomic purchase implementation:
   * We issue a conditional update (`quantity > 0`) at the PostgreSQL database engine level.
   * PostgreSQL guarantees that if multiple concurrent requests target the same vehicle,
   * row locks serialize execution, decrementing only while stock remains.
   * If stock reaches 0, updateMany returns count: 0, preventing race condition overselling.
   */
  async atomicDecrementStock(id: string): Promise<Vehicle | null> {
    const result = await this.prisma.vehicle.updateMany({
      where: {
        id,
        quantity: { gt: 0 },
      },
      data: {
        quantity: { decrement: 1 },
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async incrementStock(id: string, amount: number): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        quantity: { increment: amount },
      },
    });
  }
}
