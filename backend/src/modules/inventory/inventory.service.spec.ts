import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { INVENTORY_REPOSITORY } from './interfaces/inventory-repository.interface';
import { Decimal } from '@prisma/client/runtime/library';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockInventoryRepo: any;

  const mockVehicle = {
    id: 'c82736b4-4b51-4601-b586-e889b7880922',
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: new Decimal(25000.0),
    quantity: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockInventoryRepo = {
      findById: jest.fn(),
      atomicDecrementStock: jest.fn(),
      incrementStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: INVENTORY_REPOSITORY,
          useValue: mockInventoryRepo,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('purchase', () => {
    it('should atomically decrement quantity and return updated vehicle', async () => {
      const updatedVehicle = { ...mockVehicle, quantity: 2 };
      mockInventoryRepo.atomicDecrementStock.mockResolvedValue(updatedVehicle);

      const result = await service.purchase(mockVehicle.id);
      expect(result.quantity).toBe(2);
      expect(mockInventoryRepo.atomicDecrementStock).toHaveBeenCalledWith(
        mockVehicle.id,
      );
    });

    it('should throw NotFoundException (404) if vehicle does not exist', async () => {
      mockInventoryRepo.atomicDecrementStock.mockResolvedValue(null);
      mockInventoryRepo.findById.mockResolvedValue(null);

      await expect(service.purchase('non-existent-id')).rejects.toThrow(
        new NotFoundException(
          'Vehicle with ID "non-existent-id" was not found',
        ),
      );
    });

    it('should throw ConflictException (409) if vehicle is out of stock (quantity is 0)', async () => {
      mockInventoryRepo.atomicDecrementStock.mockResolvedValue(null);
      mockInventoryRepo.findById.mockResolvedValue({
        ...mockVehicle,
        quantity: 0,
      });

      await expect(service.purchase(mockVehicle.id)).rejects.toThrow(
        new ConflictException('Vehicle is out of stock'),
      );
    });
  });

  describe('restock', () => {
    it('should increment vehicle quantity by given amount', async () => {
      mockInventoryRepo.findById.mockResolvedValue(mockVehicle);
      mockInventoryRepo.incrementStock.mockResolvedValue({
        ...mockVehicle,
        quantity: 8,
      });

      const result = await service.restock(mockVehicle.id, 5);
      expect(result.quantity).toBe(8);
      expect(mockInventoryRepo.incrementStock).toHaveBeenCalledWith(
        mockVehicle.id,
        5,
      );
    });

    it('should throw BadRequestException if restock amount is <= 0', async () => {
      await expect(service.restock(mockVehicle.id, 0)).rejects.toThrow(
        new BadRequestException('Restock amount must be a positive integer'),
      );
      await expect(service.restock(mockVehicle.id, -2)).rejects.toThrow(
        new BadRequestException('Restock amount must be a positive integer'),
      );
    });

    it('should throw NotFoundException if vehicle does not exist to restock', async () => {
      mockInventoryRepo.findById.mockResolvedValue(null);

      await expect(service.restock('missing-id', 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
