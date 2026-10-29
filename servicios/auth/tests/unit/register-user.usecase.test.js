const bcrypt = require('bcryptjs');
const RegisterUserUseCase = require('../../src/application/register-user.usecase');
const JwtTokenService = require('../../src/infrastructure/jwt.token-service');
const { InMemoryUserRepository, FakeEventPublisher } = require('../helpers/in-memory');

function buildUseCase({ publisher = new FakeEventPublisher(), logger = { error: jest.fn() } } = {}) {
  const userRepository = new InMemoryUserRepository();
  const tokenService = new JwtTokenService({ secret: 'test-secret', expiresIn: '1h' });
  const useCase = new RegisterUserUseCase({
    userRepository,
    eventPublisher: publisher,
    tokenService,
    bcryptRounds: 4,
    logger,
  });
  return { useCase, userRepository, publisher, tokenService, logger };
}

describe('RegisterUserUseCase', () => {
  it('guarda el usuario con la contraseña hasheada y normaliza el correo', async () => {
    const { useCase, userRepository } = buildUseCase();

    const result = await useCase.execute({ name: '  Ana  ', email: 'ANA@Gym.com ', password: 'secreto1' });

    const stored = userRepository.users[0];
    expect(stored.email).toBe('ana@gym.com');
    expect(stored.name).toBe('Ana');
    expect(stored.passwordHash).not.toBe('secreto1');
    expect(await bcrypt.compare('secreto1', stored.passwordHash)).toBe(true);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.role).toBe('user');
  });

  it('emite un JWT válido con los datos públicos del usuario', async () => {
    const { useCase, tokenService } = buildUseCase();

    const { token, user } = await useCase.execute({ name: 'Ana', email: 'ana@gym.com', password: 'secreto1' });

    const decoded = tokenService.verify(token);
    expect(decoded).toMatchObject({ id: user.id, email: 'ana@gym.com', role: 'user' });
  });

  it('publica el evento usuario.creado con los datos del nuevo usuario', async () => {
    const { useCase, publisher } = buildUseCase();

    const { user } = await useCase.execute({ name: 'Ana', email: 'ana@gym.com', password: 'secreto1' });

    expect(publisher.published).toHaveLength(1);
    expect(publisher.published[0].routingKey).toBe('usuario.creado');
    expect(publisher.published[0].payload.data).toMatchObject({ id: user.id, email: 'ana@gym.com' });
    expect(publisher.published[0].payload.data).not.toHaveProperty('passwordHash');
  });

  it('ignora el rol enviado por el cliente', async () => {
    const { useCase } = buildUseCase();

    const { user } = await useCase.execute({ name: 'Ana', email: 'ana@gym.com', password: 'secreto1', role: 'admin' });

    expect(user.role).toBe('user');
  });

  it('rechaza un correo ya registrado con 409', async () => {
    const { useCase } = buildUseCase();
    await useCase.execute({ name: 'Ana', email: 'ana@gym.com', password: 'secreto1' });

    await expect(
      useCase.execute({ name: 'Otra Ana', email: 'ANA@gym.com', password: 'secreto2' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it.each([
    [{ email: 'ana@gym.com', password: 'secreto1' }, 'sin nombre'],
    [{ name: 'Ana', email: 'no-es-correo', password: 'secreto1' }, 'correo inválido'],
    [{ name: 'Ana', email: 'ana@gym.com', password: '123' }, 'contraseña corta'],
  ])('rechaza datos inválidos con 400 (%#: %s)', async (input) => {
    const { useCase, userRepository } = buildUseCase();

    await expect(useCase.execute(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(userRepository.users).toHaveLength(0);
  });

  it('completa el registro aunque RabbitMQ no esté disponible y lo registra en el log', async () => {
    const { useCase, userRepository, logger } = buildUseCase({ publisher: new FakeEventPublisher({ fail: true }) });

    const result = await useCase.execute({ name: 'Ana', email: 'ana@gym.com', password: 'secreto1' });

    expect(result.token).toBeDefined();
    expect(userRepository.users).toHaveLength(1);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('usuario.creado'));
  });
});
