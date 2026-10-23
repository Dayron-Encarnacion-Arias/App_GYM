require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym_app',
  jwtSecret: process.env.JWT_SECRET || 'development_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  sql: {
    server: process.env.SQL_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.SQL_DATABASE || 'GymFlow',
    trustedConnection: process.env.SQL_TRUSTED_CONNECTION !== 'false',
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE !== 'false',
    odbcDriver: process.env.SQL_ODBC_DRIVER || 'ODBC Driver 18 for SQL Server',
  },
};
