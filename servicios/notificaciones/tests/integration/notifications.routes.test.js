const jwt = require('jsonwebtoken');
const request = require('supertest');
const createApp = require('../../src/app');
const { InMemoryNotificationRepository } = require('../helpers/in-memory');

const SECRET = 'test-secret';
const tokenFor = (id) => jwt.sign({ id, email: `${id}@gym.com` }, SECRET, { expiresIn: '1h' });

describe('API de notificaciones (Supertest)', () => {
  let app;
  let repository;

  beforeEach(async () => {
    repository = new InMemoryNotificationRepository();
    await repository.createIfNew({ userId: 'ana', email: 'ana@gym.com', type: 'BIENVENIDA', title: 'Hola Ana', message: '...', dedupeKey: 'a' });
    await repository.createIfNew({ userId: 'luis', email: 'luis@gym.com', type: 'BIENVENIDA', title: 'Hola Luis', message: '...', dedupeKey: 'b' });
    app = createApp({ notificationRepository: repository, jwtSecret: SECRET });
  });

  it('GET /api/notifications sin token responde 401', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications devuelve solo las del usuario del token', async () => {
    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${tokenFor('ana')}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ count: 1, unread: 1 });
    expect(res.body.data[0].title).toBe('Hola Ana');
  });

  it('PATCH /api/notifications/:id/read marca como leída solo si es propia', async () => {
    const ajena = await request(app).patch('/api/notifications/2/read').set('Authorization', `Bearer ${tokenFor('ana')}`);
    expect(ajena.status).toBe(404);

    const propia = await request(app).patch('/api/notifications/1/read').set('Authorization', `Bearer ${tokenFor('ana')}`);
    expect(propia.status).toBe(200);
    expect(propia.body.data.read).toBe(true);
  });
});
