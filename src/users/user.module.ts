import { Module } from '@nestjs/common';
import { UserService } from '@/users/services/user.service';
import { UserRepository } from '@/users/repositories/user.repository';
import { SqlDatabaseModule } from '@/lib/external/azure/sql-database/sql-database.module';

@Module({
  imports: [SqlDatabaseModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
