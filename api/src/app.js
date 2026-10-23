const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorMiddleware = require('./middlewares/error.middleware');
const AppError = require('./utils/custom-error');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'GymFlow API activa' }));
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/exercises', require('./modules/exercises/infrastructure/routes/exercise.routes'));
app.use('/api/schedules', require('./modules/schedules/schedule.routes'));
app.use('/api/workouts', require('./modules/workouts/workout.routes'));
app.use((req, res, next) => next(new AppError(`Ruta ${req.method} ${req.originalUrl} no encontrada`, 404)));
app.use(errorMiddleware);

module.exports = app;
