import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IInventoryRepository,
  INVENTORY_REPOSITORY,
} from './interfaces/inventory-repository.interface';
import { Vehicle } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: IInventoryRepository,
  ) {}

  async purchase(id: string): Promise<Vehicle> {
    const updated = await this.inventoryRepository.atomicDecrementStock(id);
    if (!updated) {
      // Determine whether the failure was due to non-existence (404) or zero inventory (409)
      const vehicle = await this.inventoryRepository.findById(id);
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID "${id}" was not found`);
      }
      throw new ConflictException('Vehicle is out of stock');
    }
    return updated;
  }

  async restock(id: string, amount: number): Promise<Vehicle> {
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      throw new BadRequestException(
        'Restock amount must be a positive integer',
      );
    }

    const vehicle = await this.inventoryRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" was not found`);
    }

    return this.inventoryRepository.incrementStock(id, amount);
  }
}
