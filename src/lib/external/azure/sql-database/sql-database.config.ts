import { config } from 'mssql';

export const sqlDatabaseConfig: config = {
  // user: process.env.DB_USER || 'sa',
  // password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  database: process.env.DB_NAME || 'applicationDB',
  server: process.env.DB_HOST || 'localhost', //name_container
  // port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true, // true = Azure , false Contenedor Local
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  authentication:{
    type: 'azure-active-directory-service-principal-secret',
    options:{
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenantId: process.env.AZURE_TENANT_ID,
    }
  },
  pool: {
    max: 10, // Número máximo de conexiones en el pool
    min: 0,
    idleTimeoutMillis: 30000,
  },
};