import { Vehicle } from '@prisma/client';

export const INVENTORY_REPOSITORY = 'INVENTORY_REPOSITORY';

export interface IInventoryRepository {
  findById(id: string): Promise<Vehicle | null>;
  atomicDecrementStock(id: string): Promise<Vehicle | null>;
  incrementStock(id: string, amount: number): Promise<Vehicle>;
}
