import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate register call to AuthService', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };
    const expected = {
      id: 'uuid',
      email: dto.email,
      role: Role.USER,
      createdAt: new Date(),
    };
    mockAuthService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toEqual(expected);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should delegate login call to AuthService', async () => {
    const dto = { email: 'test@example.com', password: 'Password123!' };
    const expected = {
      accessToken: 'token',
      user: { id: 'uuid', email: dto.email, role: Role.USER },
    };
    mockAuthService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);
    expect(result).toEqual(expected);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
