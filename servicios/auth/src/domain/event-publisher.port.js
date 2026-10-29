/**
 * Puerto de salida para publicar eventos de dominio (implementado con RabbitMQ).
 */
class EventPublisherPort {
  async publish(routingKey, payload) {
    throw new Error('Método publish no implementado');
  }
}

EventPublisherPort.EVENTS = {
  USER_CREATED: 'usuario.creado',
};

module.exports = EventPublisherPort;
