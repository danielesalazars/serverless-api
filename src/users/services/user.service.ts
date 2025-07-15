import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository'; 
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userRepository.create({
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      email: createUserDto.email,
      password_hash: hashedPassword,
      role: createUserDto.role || 'user',
      is_active: true,
    });

    const { password_hash, ...userWithoutPasswordHash } = newUser;
    return userWithoutPasswordHash;
  }

  async findUserById(id: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    const { password_hash, ...userWithoutPasswordHash } = user;
    return userWithoutPasswordHash;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const updates: Partial<User> = {
      first_name: updateUserDto.first_name,
      last_name: updateUserDto.last_name,
      email: updateUserDto.email,
      role: updateUserDto.role,
      is_active: updateUserDto.is_active,
    };

    if (updateUserDto.password) {
      updates.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updates);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found for update.`);
    }

    const { password_hash, ...userWithoutPasswordHash } = updatedUser;
    return userWithoutPasswordHash;
  }

  async deleteUser(id: string): Promise<void> {
    const success = await this.userRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
  }
}