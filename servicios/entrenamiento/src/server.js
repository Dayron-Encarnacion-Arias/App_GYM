const mongoose = require('mongoose');
const config = require('./config/env');
const connectMongo = require('./config/mongo');
const { connectSqlServer, pool } = require('./config/sqlserver');
const createApp = require('./app');
const retry = require('./utils/retry');
const { seedExercises } = require('./utils/seeder');
const { startConsumer } = require('./messaging/rabbitmq.consumer');
const handleUserCreated = require('./modules/members/user-created.handler');
const ExerciseMongoRepository = require('./modules/exercises/infrastructure/adapters/exercise.mongo.repository');
const WorkoutSqlRepository = require('./modules/workouts/workout.sql.repository');

/**
 * SQL Server se conecta en segundo plano: si no está disponible, el resto del
 * servicio (MongoDB) sigue funcionando y /api/workouts responde 503 hasta que conecte.
 */
function connectSqlInBackground() {
  retry(connectSqlServer, { retries: Infinity, delayMs: 10000, label: 'conexión a SQL Server' }).catch((error) =>
    console.error('[entrenamiento] SQL Server no disponible:', error.message)
  );
}

async function start() {
  try {
    await retry(connectMongo, { label: 'conexión a MongoDB' });
    await seedExercises();
    connectSqlInBackground();

    const consumer = await startConsumer({
      url: config.rabbitmqUrl,
      exchange: config.eventsExchange,
      queue: config.userCreatedQueue,
      routingKey: 'usuario.creado',
      handler: handleUserCreated,
      serviceName: 'entrenamiento',
    });

    const app = createApp({
      exerciseRepository: new ExerciseMongoRepository(),
      workoutRepository: new WorkoutSqlRepository(pool),
      healthCheck: () => ({
        mongodb: mongoose.connection.readyState === 1 ? 'up' : 'down',
        sqlserver: pool.connected ? 'up' : 'down',
      }),
    });

    const server = app.listen(config.port, () => {
      console.log(`[entrenamiento] Servicio de negocio escuchando en el puerto ${config.port}`);
    });

    const shutdown = async () => {
      server.close();
      await consumer.close().catch(() => {});
      await pool.close().catch(() => {});
      await mongoose.disconnect();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[entrenamiento] No se pudo iniciar el servicio:', error.message);
    process.exit(1);
  }
}

start();
