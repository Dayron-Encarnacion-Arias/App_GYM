const express = require('express');
const morgan = require('morgan');
const config = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');
const createAuthMiddleware = require('./middlewares/auth.middleware');
const AppError = require('./utils/custom-error');
const createExerciseRouter = require('./modules/exercises/infrastructure/routes/exercise.routes');
const createScheduleRouter = require('./modules/schedules/schedule.routes');
const createWorkoutRouter = require('./modules/workouts/workout.routes');
const createMemberRouter = require('./modules/members/member.routes');

/**
 * Servicio de negocio (entrenamiento). Recibe los repositorios por parámetro para
 * que las pruebas puedan usar implementaciones en memoria.
 */
function createApp({ exerciseRepository, workoutRepository, jwtSecret = config.jwtSecret, healthCheck }) {
  const app = express();
  const requireAuth = createAuthMiddleware(jwtSecret);

  app.use(express.json({ limit: '1mb' }));
  if (config.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    const dependencies = healthCheck ? healthCheck() : {};
    res.json({ success: true, service: 'entrenamiento', status: 'ok', dependencies });
  });

  app.use('/api/exercises', createExerciseRouter({ exerciseRepository, requireAuth }));
  app.use('/api/workouts', createWorkoutRouter({ workoutRepository, requireAuth }));
  app.use('/api/schedules', createScheduleRouter({ requireAuth }));
  app.use('/api/members', createMemberRouter({ requireAuth }));

  app.use((req, res, next) => next(new AppError(`Ruta ${req.method} ${req.originalUrl} no encontrada`, 404)));
  app.use(errorMiddleware);
  return app;
}

module.exports = createApp;
