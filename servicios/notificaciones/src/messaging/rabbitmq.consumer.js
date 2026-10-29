const amqp = require('amqplib');
const retry = require('../utils/retry');

/**
 * Suscribe una cola durable al exchange de eventos y procesa cada mensaje.
 * - ack cuando el handler termina bien.
 * - si falla, se reencola una vez; si vuelve a fallar se descarta para no bloquear la cola
 *   (el error queda en el log).
 */
async function startConsumer({ url, exchange, queue, routingKey, handler, serviceName }) {
  let closing = false;
  let connection;

  async function connect() {
    await retry(async () => {
      connection = await amqp.connect(url);
    }, { label: 'conexión a RabbitMQ' });

    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.prefetch(10);

    await channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`[${serviceName}] Evento recibido: ${msg.fields.routingKey} (${payload.data?.email || 'sin email'})`);
        await handler(payload);
        channel.ack(msg);
      } catch (error) {
        console.error(`[${serviceName}] Error procesando ${msg.fields.routingKey}: ${error.message}`);
        channel.nack(msg, false, !msg.fields.redelivered);
      }
    });

    connection.on('error', (error) => console.error(`[${serviceName}] Error en RabbitMQ:`, error.message));
    connection.on('close', () => {
      if (closing) return;
      console.warn(`[${serviceName}] Conexión con RabbitMQ cerrada, reintentando...`);
      connect().catch((error) => console.error(`[${serviceName}] No se pudo reconectar a RabbitMQ:`, error.message));
    });

    console.log(`[${serviceName}] Escuchando "${routingKey}" en la cola "${queue}"`);
  }

  await connect();

  return {
    async close() {
      closing = true;
      if (connection) await connection.close();
    },
  };
}

module.exports = { startConsumer };
