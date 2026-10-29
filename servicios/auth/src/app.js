const express = require('express');
const morgan = require('morgan');
const config = require('./config/env');
const AppError = require('./utils/custom-error');
const errorMiddleware = require('./middlewares/error.middleware');
const createAuthRouter = require('./http/auth.routes');
const RegisterUserUseCase = require('./application/register-user.usecase');
const LoginUserUseCase = require('./application/login-user.usecase');
const GetProfileUseCase = require('./application/get-profile.usecase');

/**
 * Construye la app recibiendo sus dependencias (repositorio, publicador y tokens).
 * Así las pruebas pueden usar dobles en memoria sin PostgreSQL ni RabbitMQ.
 */
function createApp({ userRepository, eventPublisher, tokenService, bcryptRounds = config.bcryptRounds }) {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  if (config.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ success: true, service: 'auth', status: 'ok' }));

  app.use(
    '/api/auth',
    createAuthRouter({
      registerUser: new RegisterUserUseCase({ userRepository, eventPublisher, tokenService, bcryptRounds }),
      loginUser: new LoginUserUseCase({ userRepository, tokenService }),
      getProfile: new GetProfileUseCase({ userRepository }),
      tokenService,
    })
  );

  app.use((req, res, next) => next(new AppError(`Ruta ${req.method} ${req.originalUrl} no encontrada`, 404)));
  app.use(errorMiddleware);
  return app;
}

module.exports = createApp;
