require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 4002,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym_app',
  jwtSecret: process.env.JWT_SECRET || 'development_only_change_me',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://gymflow:gymflow_dev@localhost:5672',
  eventsExchange: process.env.EVENTS_EXCHANGE || 'gymflow.events',
  userCreatedQueue: process.env.USER_CREATED_QUEUE || 'entrenamiento.usuario.creado',
  sql: {
    // "sql": usuario y contraseña de SQL Server (necesario dentro de Docker/Linux).
    // "windows": autenticación integrada de Windows (solo al ejecutar con Node en Windows).
    auth: process.env.SQL_AUTH || 'sql',
    server: process.env.SQL_SERVER || 'localhost',
    port: Number(process.env.SQL_PORT) || 1433,
    database: process.env.SQL_DATABASE || 'GymFlow',
    user: process.env.SQL_USER || '',
    password: process.env.SQL_PASSWORD || '',
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE !== 'false',
    odbcDriver: process.env.SQL_ODBC_DRIVER || 'ODBC Driver 18 for SQL Server',
  },
};
