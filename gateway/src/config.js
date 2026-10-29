require('dotenv').config();

const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  entrenamiento: process.env.ENTRENAMIENTO_SERVICE_URL || 'http://localhost:4002',
  notificaciones: process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:4003',
};

module.exports = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  services,
  // Tabla de enrutamiento: prefijo público -> servicio que lo atiende.
  routes: [
    { prefix: '/api/auth', service: 'auth' },
    { prefix: '/api/exercises', service: 'entrenamiento' },
    { prefix: '/api/schedules', service: 'entrenamiento' },
    { prefix: '/api/workouts', service: 'entrenamiento' },
    { prefix: '/api/members', service: 'entrenamiento' },
    { prefix: '/api/notifications', service: 'notificaciones' },
  ],
};
