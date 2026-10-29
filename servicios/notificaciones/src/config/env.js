require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 4003,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.NOTIFICATIONS_MONGO_URI || 'mongodb://127.0.0.1:27018/notificaciones',
  jwtSecret: process.env.JWT_SECRET || 'development_only_change_me',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://gymflow:gymflow_dev@localhost:5672',
  eventsExchange: process.env.EVENTS_EXCHANGE || 'gymflow.events',
  userCreatedQueue: process.env.USER_CREATED_QUEUE || 'notificaciones.usuario.creado',
};
