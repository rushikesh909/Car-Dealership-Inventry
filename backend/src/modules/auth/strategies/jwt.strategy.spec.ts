import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../../../common/enums/role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUsersService = {
      findById: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret-at-least-32-chars-long!'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user profile from payload', async () => {
    const payload = { sub: 'uuid-1', email: 'user@test.com', role: Role.USER };
    mockUsersService.findById.mockResolvedValue({
      id: 'uuid-1',
      email: 'user@test.com',
      role: Role.USER,
    });

    const result = await strategy.validate(payload);
    expect(result).toEqual({
      id: 'uuid-1',
      email: 'user@test.com',
      role: Role.USER,
    });
    expect(mockUsersService.findById).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw UnauthorizedException if user no longer exists', async () => {
    const payload = {
      sub: 'deleted-uuid',
      email: 'deleted@test.com',
      role: Role.USER,
    };
    mockUsersService.findById.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
