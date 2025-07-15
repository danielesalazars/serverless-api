import { Module } from '@nestjs/common';
import { SqlDatabaseService } from '@lib/external/azure/sql-database/sql-database.service';

@Module({
  providers: [SqlDatabaseService],
  exports: [SqlDatabaseService],
})
export class SqlDatabaseModule {}