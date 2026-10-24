import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let mockInventoryService: any;

  const mockVehicle = {
    id: 'c82736b4-4b51-4601-b586-e889b7880922',
    make: 'Honda',
    model: 'Civic',
    category: 'Sedan',
    price: 25000.0,
    quantity: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockInventoryService = {
      purchase: jest.fn(),
      restock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should purchase vehicle via service', async () => {
    const purchased = { ...mockVehicle, quantity: 2 };
    mockInventoryService.purchase.mockResolvedValue(purchased);

    const result = await controller.purchase(mockVehicle.id);
    expect(result).toEqual(purchased);
    expect(mockInventoryService.purchase).toHaveBeenCalledWith(mockVehicle.id);
  });

  it('should restock vehicle via service', async () => {
    const restocked = { ...mockVehicle, quantity: 8 };
    mockInventoryService.restock.mockResolvedValue(restocked);

    const result = await controller.restock(mockVehicle.id, { amount: 5 });
    expect(result).toEqual(restocked);
    expect(mockInventoryService.restock).toHaveBeenCalledWith(
      mockVehicle.id,
      5,
    );
  });
});
