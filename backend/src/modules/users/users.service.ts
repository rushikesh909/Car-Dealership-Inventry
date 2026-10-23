import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USERS_REPOSITORY,
  CreateUserData,
} from './interfaces/users-repository.interface';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async create(data: CreateUserData): Promise<User> {
    return this.usersRepository.create(data);
  }
}
