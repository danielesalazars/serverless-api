import * as mssql from 'mssql';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { sqlDatabaseConfig } from '@/lib/external/azure/sql-database/sql-database.config';

@Injectable()
export class SqlDatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mssql.ConnectionPool;

  async onModuleInit() {
    let retries = 5;
    while (retries) {
      try {
        this.pool = await new mssql.ConnectionPool(sqlDatabaseConfig).connect();
        console.log('✅ Conectado a SQL Server');
        break;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.error(
          `❌ Error conectando a SQL Server. Reintentando en 5s... (${retries} intentos restantes)`,
        );
        retries--;
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
  }

  async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    try {
      const request = this.pool.request();
      params.forEach((param, index) => {
        request.input(`param${index + 1}`, param);
      });

      const result = await request.query<T>(query);
      return result.recordset;
    } catch (error) {
      console.error(`❌ Error en query: ${query}`, error);
      throw new Error('Database query failed');
    }
  }

  // 🚀 Soporte para transacciones
  async beginTransaction(): Promise<mssql.Transaction> {
    const transaction = new mssql.Transaction(this.pool);
    await transaction.begin();
    return transaction;
  }

  async commit(transaction: mssql.Transaction) {
    await transaction.commit();
  }

  async rollback(transaction: mssql.Transaction) {
    await transaction.rollback();
  }

  async onModuleDestroy() {
    await this.pool.close();
    console.log('❌ Conexión cerrada con Azure SQL Database');
  }
}
