import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('1d'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password and create a new user with USER role', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockImplementation(async (data: any) => ({
        id: 'new-user-uuid',
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          role: Role.USER,
        }),
      );
      // Password must be hashed
      const createCall = mockUsersService.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('Password123!');
      expect(
        await bcrypt.compare('Password123!', createCall.passwordHash),
      ).toBe(true);

      // Never expose passwordHash in response
      expect((result as any).passwordHash).toBeUndefined();
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe(Role.USER);
    });

    it('should throw ConflictException (409) if email is already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: 'exists@example.com',
      });

      await expect(
        service.register({
          email: 'exists@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token and user info on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-uuid',
        email: 'valid@example.com',
        passwordHash,
        role: Role.USER,
      });

      const result = await service.login({
        email: 'valid@example.com',
        password: 'CorrectPass123!',
      });

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).toEqual({
        id: 'user-uuid',
        email: 'valid@example.com',
        role: Role.USER,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-uuid',
          email: 'valid@example.com',
          role: Role.USER,
        }),
        { expiresIn: '1d' },
      );
    });

    it('should throw UnauthorizedException with generic message if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException with generic message if password does not match', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-uuid',
        email: 'user@example.com',
        passwordHash,
        role: Role.USER,
      });

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });
});
