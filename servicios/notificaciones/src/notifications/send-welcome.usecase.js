/**
 * Reacción al evento usuario.creado: genera el aviso de bienvenida, lo guarda en
 * la base de datos de notificaciones y lo "envía" (en este proyecto, a la consola).
 */
class SendWelcomeNotificationUseCase {
  constructor({ notificationRepository, logger = console }) {
    this.notificationRepository = notificationRepository;
    this.logger = logger;
  }

  async execute(event) {
    const user = event && event.data;
    if (!user || !user.id || !user.email) {
      throw new Error('Evento usuario.creado sin datos de usuario');
    }

    const firstName = String(user.name || '').trim().split(/\s+/)[0] || 'atleta';
    const notification = {
      userId: user.id,
      email: user.email,
      type: 'BIENVENIDA',
      title: `¡Bienvenido a GymFlow, ${firstName}!`,
      message: 'Tu cuenta está lista. Te preparamos un plan semanal de bienvenida en tu agenda: ajústalo a tu ritmo.',
      dedupeKey: `bienvenida:${user.id}`,
    };

    const created = await this.notificationRepository.createIfNew(notification);
    if (!created) {
      this.logger.log(`[notificaciones] Bienvenida para ${user.email} ya existía, evento duplicado ignorado`);
      return false;
    }

    this.logger.log(`[notificaciones] ✉  Correo de bienvenida enviado a ${user.email}: "${notification.title}"`);
    return true;
  }
}

module.exports = SendWelcomeNotificationUseCase;
