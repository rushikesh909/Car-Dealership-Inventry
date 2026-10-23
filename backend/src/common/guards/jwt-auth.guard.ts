import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, ...args: any[]): TUser {
    void args;
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Authentication token is missing, invalid, or expired',
        )
      );
    }
    return user;
  }
}
