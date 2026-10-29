const bcrypt = require('bcryptjs');
const LoginUserUseCase = require('../../src/application/login-user.usecase');
const JwtTokenService = require('../../src/infrastructure/jwt.token-service');
const { InMemoryUserRepository } = require('../helpers/in-memory');

describe('LoginUserUseCase', () => {
  let useCase;
  let tokenService;

  beforeEach(async () => {
    const userRepository = new InMemoryUserRepository();
    await userRepository.create({
      name: 'Ana',
      email: 'ana@gym.com',
      passwordHash: await bcrypt.hash('secreto1', 4),
      role: 'user',
    });
    tokenService = new JwtTokenService({ secret: 'test-secret', expiresIn: '1h' });
    useCase = new LoginUserUseCase({ userRepository, tokenService });
  });

  it('devuelve un token cuando las credenciales son correctas', async () => {
    const result = await useCase.execute({ email: ' ANA@gym.com', password: 'secreto1' });

    expect(tokenService.verify(result.token).email).toBe('ana@gym.com');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('responde 401 con contraseña incorrecta', async () => {
    await expect(useCase.execute({ email: 'ana@gym.com', password: 'otra' })).rejects.toMatchObject({ statusCode: 401 });
  });

  it('responde 401 con un correo que no existe (mismo mensaje, sin revelar cuál falló)', async () => {
    const wrongEmail = useCase.execute({ email: 'nadie@gym.com', password: 'secreto1' });
    const wrongPassword = useCase.execute({ email: 'ana@gym.com', password: 'otra' });

    const [a, b] = await Promise.allSettled([wrongEmail, wrongPassword]);
    expect(a.reason.statusCode).toBe(401);
    expect(a.reason.message).toBe(b.reason.message);
  });

  it('responde 400 si faltan datos', async () => {
    await expect(useCase.execute({ email: 'ana@gym.com' })).rejects.toMatchObject({ statusCode: 400 });
  });
});
