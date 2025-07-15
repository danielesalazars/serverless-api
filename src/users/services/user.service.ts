import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  private idCounter = 1;

  constructor(private readonly usersRepository: UserRepository) {}

  getAll(): User[] {
    return this.usersRepository.findAll();
  }

  createUser(dto: CreateUserDto): User {
    const user = new User(this.idCounter++, dto.name, dto.email);
    return this.usersRepository.create(user);
  }
}
