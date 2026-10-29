const amqp = require('amqplib');
const { randomUUID } = require('crypto');
const EventPublisherPort = require('../domain/event-publisher.port');
const retry = require('../utils/retry');

/**
 * Adaptador secundario: publica eventos en un exchange "topic" de RabbitMQ.
 * Usa un canal con confirmaciones para saber que el broker recibió el mensaje.
 */
class RabbitMQPublisher extends EventPublisherPort {
  constructor({ url, exchange }) {
    super();
    this.url = url;
    this.exchange = exchange;
    this.connection = null;
    this.channel = null;
    this.closing = false;
  }

  async connect() {
    await retry(async () => {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createConfirmChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    }, { label: 'conexión a RabbitMQ' });

    this.connection.on('error', (error) => console.error('[auth] Error en RabbitMQ:', error.message));
    this.connection.on('close', () => {
      this.channel = null;
      if (!this.closing) {
        console.warn('[auth] Conexión con RabbitMQ cerrada, reintentando...');
        this.connect().catch((error) => console.error('[auth] No se pudo reconectar a RabbitMQ:', error.message));
      }
    });
    console.log(`[auth] RabbitMQ conectado (exchange "${this.exchange}")`);
  }

  async publish(routingKey, payload) {
    if (!this.channel) {
      throw new Error('RabbitMQ no está conectado');
    }
    this.channel.publish(this.exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      messageId: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
      type: routingKey,
      appId: 'auth-service',
    });
    await this.channel.waitForConfirms();
    console.log(`[auth] Evento publicado: ${routingKey} -> ${payload.data?.email || ''}`);
  }

  async close() {
    this.closing = true;
    if (this.connection) await this.connection.close();
  }
}

module.exports = RabbitMQPublisher;
