import { config } from 'mssql';

export const sqlDatabaseConfig: config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  database: process.env.DB_NAME || 'applicationDB',
  server: process.env.DB_HOST || 'localhost', //name_container
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false, // Requerido para Azure
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10, // Número máximo de conexiones en el pool
    min: 0,
    idleTimeoutMillis: 30000,
  },
};