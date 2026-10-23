import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';
import { Role } from '../../common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: any;

  beforeEach(async () => {
    mockUsersRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashedSecret',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return null if user is not found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user if found by id', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        passwordHash: 'hashedSecret',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(
        '123e4567-e89b-12d3-a456-426614174000',
      );
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        passwordHash: 'hashedPass',
        role: Role.USER,
      };
      const createdUser = {
        id: 'created-uuid',
        ...newUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(newUserData);
      expect(result).toEqual(createdUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(newUserData);
    });
  });
});
