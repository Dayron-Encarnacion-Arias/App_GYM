const SendWelcomeNotificationUseCase = require('../../src/notifications/send-welcome.usecase');
const { InMemoryNotificationRepository } = require('../helpers/in-memory');

const event = {
  event: 'usuario.creado',
  occurredAt: '2026-10-29T12:00:00.000Z',
  data: { id: 'user-1', name: 'Ana Pérez', email: 'ana@gym.com', role: 'user' },
};

describe('SendWelcomeNotificationUseCase', () => {
  let repository;
  let logger;
  let useCase;

  beforeEach(() => {
    repository = new InMemoryNotificationRepository();
    logger = { log: jest.fn() };
    useCase = new SendWelcomeNotificationUseCase({ notificationRepository: repository, logger });
  });

  it('guarda una notificación de bienvenida personalizada y la anuncia en consola', async () => {
    await expect(useCase.execute(event)).resolves.toBe(true);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0]).toMatchObject({ userId: 'user-1', type: 'BIENVENIDA', title: '¡Bienvenido a GymFlow, Ana!' });
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('ana@gym.com'));
  });

  it('es idempotente: el mismo evento dos veces crea una sola notificación', async () => {
    await useCase.execute(event);
    await expect(useCase.execute(event)).resolves.toBe(false);

    expect(repository.items).toHaveLength(1);
  });

  it('rechaza eventos sin datos de usuario', async () => {
    await expect(useCase.execute({ event: 'usuario.creado' })).rejects.toThrow(/sin datos/);
  });
});
