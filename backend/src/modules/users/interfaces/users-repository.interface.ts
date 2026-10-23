import { User, Role } from '@prisma/client';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: Role;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
