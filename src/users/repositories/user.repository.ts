import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { User } from '@/users/entities/user.entity';
import { UserQueries } from '@/users/repositories/user.queries';
import { SqlDatabaseService } from '@/lib/external/azure/sql-database/sql-database.service';

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: SqlDatabaseService) {}

  private mapRowToUser(row: any): User | undefined {
    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findAll(): Promise<User[]> {
    try {
      const result = await this.dbService.query<User>(UserQueries.getAll);
      return result
        .map((row) => this.mapRowToUser(row))
        .filter((user): user is User => user != undefined);
    } catch (error) {
      console.error('Error in UserRepository.findAll:', error.message);
      throw new InternalServerErrorException(
        'Database error when finding all users.',
      );
    }
  }

  async findById(id: string): Promise<User | undefined> {
    try {
      const result = await this.dbService.query<User>(UserQueries.getById, [
        id,
      ]);
      return result.length ? this.mapRowToUser(result[0]) : undefined;
    } catch (error) {
      console.error('Error in UserRepository.findById:', error.message);
      throw new InternalServerErrorException(
        'Database error when finding user by ID.',
      );
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.dbService.query<User>(UserQueries.getByEmail, [
        email,
      ]);
      return result.length ? this.mapRowToUser(result[0]) : undefined;
    } catch (error) {
      console.error('Error in UserRepository.findByEmail:', error.message);
      throw new InternalServerErrorException(
        'Database error when finding user by email.',
      );
    }
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const result = await this.dbService.query<User>(UserQueries.create, [
        user.first_name,
        user.last_name,
        user.email,
        user.password_hash,
        user.role ?? 'user',
        user.is_active ?? true,
      ]);
      if (result.length === 0) {
        throw new InternalServerErrorException(
          'Failed to create user, no record returned.',
        );
      }
      const createdUser = this.mapRowToUser(result[0]);
      if (createdUser === undefined) {
        throw new InternalServerErrorException('Failed to map created user.');
      }
      return createdUser;
    } catch (error) {
      console.error('Error in UserRepository.create:', error.message);
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('UNIQUE constraint')
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw new InternalServerErrorException(
        'Database error when creating user.',
      );
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return undefined;
    }
    const mergedUser = { ...existingUser, ...updates };

    try {
      const result = await this.dbService.query<User>(UserQueries.update, [
        mergedUser.first_name,
        mergedUser.last_name,
        mergedUser.email,
        id,
      ]);
      return result.length ? this.mapRowToUser(result[0]) : undefined;
    } catch (error) {
      console.error('Error in UserRepository.update:', error.message);
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('UNIQUE constraint')
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw new InternalServerErrorException(
        'Database error when updating user.',
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    // ID es string
    try {
      await this.dbService.query(UserQueries.delete, [id]);
      return true;
    } catch (error) {
      console.error('Error in UserRepository.delete:', error.message);
      throw new InternalServerErrorException(
        'Database error when deleting user.',
      );
    }
  }
}
