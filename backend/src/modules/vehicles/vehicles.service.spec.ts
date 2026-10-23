import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VEHICLES_REPOSITORY } from './interfaces/vehicles-repository.interface';
import { Decimal } from '@prisma/client/runtime/library';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let mockRepository: any;

  const mockVehicle = {
    id: 'b78a0d24-386d-4720-a681-37d45c5c84d2',
    make: 'Toyota',
    model: 'Supra',
    category: 'Sports',
    price: new Decimal(43540.0),
    quantity: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VEHICLES_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a vehicle', async () => {
      const dto = {
        make: 'Toyota',
        model: 'Supra',
        category: 'Sports',
        price: 43540.0,
        quantity: 4,
      };
      mockRepository.create.mockResolvedValue(mockVehicle);

      const result = await service.create(dto);
      expect(result).toEqual(mockVehicle);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicle list', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [mockVehicle],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('search', () => {
    it('should query vehicles by filters when minPrice <= maxPrice', async () => {
      mockRepository.search.mockResolvedValue({
        data: [mockVehicle],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const query = {
        make: 'toyota',
        minPrice: 20000,
        maxPrice: 50000,
        page: 1,
        limit: 10,
      };

      const result = await service.search(query);
      expect(result.data).toHaveLength(1);
      expect(mockRepository.search).toHaveBeenCalledWith(query);
    });

    it('should throw BadRequestException if minPrice > maxPrice', async () => {
      const invalidQuery = {
        minPrice: 60000,
        maxPrice: 30000,
      };

      await expect(service.search(invalidQuery)).rejects.toThrow(
        new BadRequestException('minPrice cannot be greater than maxPrice'),
      );
      expect(mockRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return vehicle if found', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);

      const result = await service.findById(mockVehicle.id);
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return vehicle if it exists', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);
      mockRepository.update.mockResolvedValue({
        ...mockVehicle,
        price: new Decimal(45000.0),
      });

      const result = await service.update(mockVehicle.id, { price: 45000.0 });
      expect(result.price).toEqual(new Decimal(45000.0));
      expect(mockRepository.update).toHaveBeenCalledWith(mockVehicle.id, {
        price: 45000.0,
      });
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { price: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete vehicle if it exists', async () => {
      mockRepository.findById.mockResolvedValue(mockVehicle);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(mockVehicle.id);
      expect(mockRepository.delete).toHaveBeenCalledWith(mockVehicle.id);
    });

    it('should throw NotFoundException if vehicle does not exist to delete', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
