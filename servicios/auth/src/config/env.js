require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 4001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.AUTH_DATABASE_URL || 'postgres://gymflow_auth:auth_dev_password@localhost:5433/auth_db',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://gymflow:gymflow_dev@localhost:5672',
  eventsExchange: process.env.EVENTS_EXCHANGE || 'gymflow.events',
  jwtSecret: process.env.JWT_SECRET || 'development_only_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  seedDemoUser: process.env.SEED_DEMO_USER !== 'false',
};
