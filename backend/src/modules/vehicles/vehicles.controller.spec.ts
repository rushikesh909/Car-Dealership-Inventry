import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let mockVehiclesService: any;

  const mockVehicle = {
    id: 'b78a0d24-386d-4720-a681-37d45c5c84d2',
    make: 'Tesla',
    model: 'Model S',
    category: 'Sedan',
    price: new Decimal(74990.0),
    quantity: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockVehiclesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create vehicle via service', async () => {
    const dto = {
      make: 'Tesla',
      model: 'Model S',
      category: 'Sedan',
      price: 74990.0,
      quantity: 3,
    };
    mockVehiclesService.create.mockResolvedValue(mockVehicle);

    const result = await controller.create(dto);
    expect(result).toEqual(mockVehicle);
    expect(mockVehiclesService.create).toHaveBeenCalledWith(dto);
  });

  it('should findAll vehicles via service', async () => {
    const paginated = {
      data: [mockVehicle],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    mockVehiclesService.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(result).toEqual(paginated);
    expect(mockVehiclesService.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('should search vehicles via service', async () => {
    const paginated = {
      data: [mockVehicle],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    mockVehiclesService.search.mockResolvedValue(paginated);

    const query = { make: 'Tesla' };
    const result = await controller.search(query);
    expect(result).toEqual(paginated);
    expect(mockVehiclesService.search).toHaveBeenCalledWith(query);
  });

  it('should findById via service', async () => {
    mockVehiclesService.findById.mockResolvedValue(mockVehicle);

    const result = await controller.findById(mockVehicle.id);
    expect(result).toEqual(mockVehicle);
    expect(mockVehiclesService.findById).toHaveBeenCalledWith(mockVehicle.id);
  });

  it('should update vehicle via service', async () => {
    const updated = { ...mockVehicle, price: new Decimal(79990.0) };
    mockVehiclesService.update.mockResolvedValue(updated);

    const result = await controller.update(mockVehicle.id, { price: 79990.0 });
    expect(result).toEqual(updated);
    expect(mockVehiclesService.update).toHaveBeenCalledWith(mockVehicle.id, {
      price: 79990.0,
    });
  });

  it('should delete vehicle via service', async () => {
    mockVehiclesService.delete.mockResolvedValue(undefined);

    await controller.delete(mockVehicle.id);
    expect(mockVehiclesService.delete).toHaveBeenCalledWith(mockVehicle.id);
  });
});
