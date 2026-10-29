const config = require('./config/env');
const { pool, migrate } = require('./config/database');
const createApp = require('./app');
const retry = require('./utils/retry');
const UserPostgresRepository = require('./infrastructure/user.postgres.repository');
const RabbitMQPublisher = require('./infrastructure/rabbitmq.publisher');
const JwtTokenService = require('./infrastructure/jwt.token-service');
const RegisterUserUseCase = require('./application/register-user.usecase');

const DEMO_USER = { name: 'Usuario Demo Gym', email: 'demo@gymflow.com', password: 'GymPass123!' };

async function seedDemoUser(deps) {
  if (await deps.userRepository.findByEmail(DEMO_USER.email)) return;
  await new RegisterUserUseCase({ ...deps, bcryptRounds: config.bcryptRounds }).execute(DEMO_USER);
  console.log(`[auth] Usuario demo creado: ${DEMO_USER.email}`);
}

async function start() {
  try {
    await retry(() => pool.query('SELECT 1'), { label: 'conexión a PostgreSQL' });
    await migrate();
    console.log('[auth] PostgreSQL conectado y tabla users lista');

    const eventPublisher = new RabbitMQPublisher({ url: config.rabbitmqUrl, exchange: config.eventsExchange });
    await eventPublisher.connect();

    const deps = {
      userRepository: new UserPostgresRepository(pool),
      eventPublisher,
      tokenService: new JwtTokenService({ secret: config.jwtSecret, expiresIn: config.jwtExpiresIn }),
    };
    if (config.seedDemoUser) await seedDemoUser(deps);

    const server = createApp(deps).listen(config.port, () => {
      console.log(`[auth] Servicio de autenticación escuchando en el puerto ${config.port}`);
    });

    const shutdown = async () => {
      server.close();
      await eventPublisher.close().catch(() => {});
      await pool.end();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[auth] No se pudo iniciar el servicio:', error.message);
    process.exit(1);
  }
}

start();
