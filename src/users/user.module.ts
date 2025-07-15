import { Module } from '@nestjs/common';
import { UserService } from '@/users/services/user.service';
import { UserRepository } from '@/users/repositories/user.repository';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
