const bcrypt = require('bcryptjs');
const AppError = require('../utils/custom-error');
const { EVENTS } = require('../domain/event-publisher.port');
const { normalizeEmail, validateRegistration, toPublicUser } = require('../domain/user');

class RegisterUserUseCase {
  constructor({ userRepository, eventPublisher, tokenService, bcryptRounds = 10, logger = console }) {
    this.userRepository = userRepository;
    this.eventPublisher = eventPublisher;
    this.tokenService = tokenService;
    this.bcryptRounds = bcryptRounds;
    this.logger = logger;
  }

  async execute({ name, email, password }) {
    validateRegistration({ name, email, password });
    const normalizedEmail = normalizeEmail(email);

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('Ya existe una cuenta registrada con este correo electrónico', 409);
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    const user = await this.userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      // El rol lo asigna el servidor: nunca se confía en el valor enviado por el cliente.
      role: 'user',
    });

    const publicUser = toPublicUser(user);
    await this.publishUserCreated(publicUser);

    return {
      user: publicUser,
      token: this.tokenService.sign(publicUser),
      expiresIn: this.tokenService.expiresIn,
    };
  }

  /**
   * El registro ya quedó guardado: si RabbitMQ no está disponible no se revierte,
   * solo se deja constancia en el log.
   */
  async publishUserCreated(user) {
    try {
      await this.eventPublisher.publish(EVENTS.USER_CREATED, {
        event: EVENTS.USER_CREATED,
        occurredAt: new Date().toISOString(),
        data: user,
      });
    } catch (error) {
      this.logger.error(`[auth] No se pudo publicar ${EVENTS.USER_CREATED} para ${user.email}: ${error.message}`);
    }
  }
}

module.exports = RegisterUserUseCase;
