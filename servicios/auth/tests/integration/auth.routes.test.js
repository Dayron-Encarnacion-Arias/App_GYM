const request = require('supertest');
const createApp = require('../../src/app');
const JwtTokenService = require('../../src/infrastructure/jwt.token-service');
const { InMemoryUserRepository, FakeEventPublisher } = require('../helpers/in-memory');

describe('API de autenticación (Supertest)', () => {
  let app;
  let publisher;
  const tokenService = new JwtTokenService({ secret: 'test-secret', expiresIn: '1h' });
  const credentials = { name: 'Ana Pérez', email: 'ana@gym.com', password: 'secreto1' };

  beforeEach(() => {
    publisher = new FakeEventPublisher();
    app = createApp({
      userRepository: new InMemoryUserRepository(),
      eventPublisher: publisher,
      tokenService,
      bcryptRounds: 4,
    });
  });

  describe('POST /api/auth/register', () => {
    it('crea el usuario, devuelve 201 con token y publica usuario.creado', async () => {
      const res = await request(app).post('/api/auth/register').send(credentials);

      expect(res.status).toBe(201);
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user).toMatchObject({ name: 'Ana Pérez', email: 'ana@gym.com', role: 'user' });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(publisher.published.map((event) => event.routingKey)).toEqual(['usuario.creado']);
    });

    it('responde 409 si el correo ya existe', async () => {
      await request(app).post('/api/auth/register').send(credentials);
      const res = await request(app).post('/api/auth/register').send(credentials);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('responde 400 si el JSON está mal formado', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": ');

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('devuelve 200 y un token con credenciales válidas', async () => {
      await request(app).post('/api/auth/register').send(credentials);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: credentials.email, password: credentials.password });

      expect(res.status).toBe(200);
      expect(tokenService.verify(res.body.data.token).email).toBe('ana@gym.com');
    });

    it('devuelve 401 con contraseña incorrecta', async () => {
      await request(app).post('/api/auth/register').send(credentials);

      const res = await request(app).post('/api/auth/login').send({ email: credentials.email, password: 'mala' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me (ruta protegida)', () => {
    it('responde 401 sin token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token/i);
    });

    it('responde 401 con un token alterado', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token.falso.123');

      expect(res.status).toBe(401);
    });

    it('responde 200 con el perfil cuando el token es válido', async () => {
      const registered = await request(app).post('/api/auth/register').send(credentials);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registered.body.data.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ email: 'ana@gym.com', name: 'Ana Pérez' });
    });
  });

  it('GET /health responde 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
