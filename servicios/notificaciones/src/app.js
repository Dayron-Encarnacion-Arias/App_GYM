const express = require('express');
const morgan = require('morgan');
const config = require('./config/env');
const AppError = require('./utils/custom-error');
const errorMiddleware = require('./middlewares/error.middleware');
const createAuthMiddleware = require('./middlewares/auth.middleware');
const createNotificationRouter = require('./notifications/notification.routes');

function createApp({ notificationRepository, jwtSecret = config.jwtSecret }) {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  if (config.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ success: true, service: 'notificaciones', status: 'ok' }));
  app.use(
    '/api/notifications',
    createNotificationRouter({ notificationRepository, requireAuth: createAuthMiddleware(jwtSecret) })
  );

  app.use((req, res, next) => next(new AppError(`Ruta ${req.method} ${req.originalUrl} no encontrada`, 404)));
  app.use(errorMiddleware);
  return app;
}

module.exports = createApp;
