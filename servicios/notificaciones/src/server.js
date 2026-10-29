const mongoose = require('mongoose');
const config = require('./config/env');
const createApp = require('./app');
const retry = require('./utils/retry');
const { startConsumer } = require('./messaging/rabbitmq.consumer');
const NotificationMongoRepository = require('./notifications/notification.mongo.repository');
const SendWelcomeNotificationUseCase = require('./notifications/send-welcome.usecase');

async function start() {
  try {
    await retry(() => mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 }), {
      label: 'conexión a MongoDB de notificaciones',
    });
    console.log(`[notificaciones] MongoDB conectado (${mongoose.connection.host}/${mongoose.connection.name})`);

    const notificationRepository = new NotificationMongoRepository();
    const sendWelcome = new SendWelcomeNotificationUseCase({ notificationRepository });

    const consumer = await startConsumer({
      url: config.rabbitmqUrl,
      exchange: config.eventsExchange,
      queue: config.userCreatedQueue,
      routingKey: 'usuario.creado',
      handler: (event) => sendWelcome.execute(event),
      serviceName: 'notificaciones',
    });

    const server = createApp({ notificationRepository }).listen(config.port, () => {
      console.log(`[notificaciones] Servicio de notificaciones escuchando en el puerto ${config.port}`);
    });

    const shutdown = async () => {
      server.close();
      await consumer.close().catch(() => {});
      await mongoose.disconnect();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[notificaciones] No se pudo iniciar el servicio:', error.message);
    process.exit(1);
  }
}

start();
