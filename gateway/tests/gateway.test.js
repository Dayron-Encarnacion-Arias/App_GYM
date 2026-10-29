const express = require('express');
const request = require('supertest');
const createApp = require('../src/app');

/**
 * Levanta servicios "falsos" en puertos aleatorios para comprobar que el gateway
 * reenvía cada ruta al servicio correcto, con método, cuerpo y headers intactos.
 */
function startStub(name) {
  const stub = express();
  stub.use(express.json());
  stub.get('/health', (req, res) => res.json({ status: 'ok' }));
  stub.all('*', (req, res) =>
    res.status(req.method === 'POST' ? 201 : 200).json({
      servedBy: name,
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      authorization: req.headers.authorization || null,
      requestId: req.headers['x-request-id'] || null,
    })
  );
  return new Promise((resolve) => {
    const server = stub.listen(0, () => resolve(server));
  });
}

describe('API Gateway', () => {
  let stubs;
  let app;

  beforeAll(async () => {
    stubs = {
      auth: await startStub('auth'),
      entrenamiento: await startStub('entrenamiento'),
    };
    const url = (server) => `http://127.0.0.1:${server.address().port}`;
    app = createApp({
      nodeEnv: 'test',
      corsOrigins: ['http://localhost:5173'],
      services: {
        auth: url(stubs.auth),
        entrenamiento: url(stubs.entrenamiento),
        notificaciones: 'http://127.0.0.1:1', // puerto cerrado: simula un servicio caído
      },
      routes: [
        { prefix: '/api/auth', service: 'auth' },
        { prefix: '/api/exercises', service: 'entrenamiento' },
        { prefix: '/api/notifications', service: 'notificaciones' },
      ],
    });
  });

  afterAll(() => Promise.all(Object.values(stubs).map((server) => new Promise((resolve) => server.close(resolve)))));

  it('reenvía /api/auth al servicio de autenticación con el cuerpo JSON', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ana@gym.com', password: 'secreto1' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      servedBy: 'auth',
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'ana@gym.com', password: 'secreto1' },
    });
  });

  it('reenvía /api/exercises al servicio de entrenamiento conservando el token y la query', async () => {
    const res = await request(app).get('/api/exercises?muscleGroup=Pecho').set('Authorization', 'Bearer abc');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ servedBy: 'entrenamiento', path: '/api/exercises?muscleGroup=Pecho', authorization: 'Bearer abc' });
    expect(res.body.requestId).toEqual(expect.any(String));
  });

  it('responde 502 en JSON si el servicio destino no está disponible', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/notifications');
    consoleError.mockRestore();

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ success: false, message: expect.stringContaining('notificaciones') });
  });

  it('responde 404 para rutas que no pertenecen a ningún servicio', async () => {
    const res = await request(app).get('/api/desconocida');
    expect(res.status).toBe(404);
  });

  it('permite CORS al origen del frontend', async () => {
    const res = await request(app).options('/api/auth/login').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('GET /api/health informa qué servicios están arriba', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.services).toMatchObject({
      auth: { status: 'up' },
      entrenamiento: { status: 'up' },
      notificaciones: { status: 'down' },
    });
  });
});
