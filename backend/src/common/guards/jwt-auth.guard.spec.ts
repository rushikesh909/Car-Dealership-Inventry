import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return user if user is present without error', () => {
    const user = { id: 'u1', email: 'test@example.com' };
    expect(guard.handleRequest(null, user, null)).toEqual(user);
  });

  it('should throw UnauthorizedException if user is missing', () => {
    expect(() => guard.handleRequest(null, null, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw error if error is present', () => {
    const err = new Error('JWT expired');
    expect(() => guard.handleRequest(err, null, null)).toThrow(err);
  });
});
