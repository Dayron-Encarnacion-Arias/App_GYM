const request = require('supertest');
const createApp = require('../../src/app');
const { InMemoryExerciseRepository, InMemoryWorkoutRepository, signToken, JWT_SECRET } = require('../helpers/in-memory');

const press = { name: 'Press de Banca', muscleGroup: 'Pecho', difficulty: 'Intermedio', sets: 4, reps: 10, restSeconds: 90 };

describe('API del servicio de entrenamiento (Supertest)', () => {
  let app;
  let exerciseRepository;
  const token = signToken();

  beforeEach(() => {
    exerciseRepository = new InMemoryExerciseRepository([press]);
    app = createApp({
      exerciseRepository,
      workoutRepository: new InMemoryWorkoutRepository(),
      jwtSecret: JWT_SECRET,
    });
  });

  describe('GET /api/exercises (pública)', () => {
    it('lista los ejercicios', async () => {
      const res = await request(app).get('/api/exercises');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe('Press de Banca');
    });

    it('filtra por grupo muscular', async () => {
      const res = await request(app).get('/api/exercises').query({ muscleGroup: 'Piernas' });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('responde 404 si el id no existe', async () => {
      const res = await request(app).get('/api/exercises/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/exercises (protegida)', () => {
    const nuevo = { name: 'Remo con Barra', muscleGroup: 'Espalda', sets: 4, reps: 10, restSeconds: 90 };

    it('responde 401 sin token y no crea nada', async () => {
      const res = await request(app).post('/api/exercises').send(nuevo);

      expect(res.status).toBe(401);
      expect(exerciseRepository.items).toHaveLength(1);
    });

    it('responde 401 con un token firmado con otro secreto', async () => {
      const jwt = require('jsonwebtoken');
      const forged = jwt.sign({ id: 'x' }, 'otro-secreto');

      const res = await request(app).post('/api/exercises').set('Authorization', `Bearer ${forged}`).send(nuevo);

      expect(res.status).toBe(401);
    });

    it('responde 201 con token válido y guarda el id del usuario', async () => {
      const res = await request(app).post('/api/exercises').set('Authorization', `Bearer ${token}`).send(nuevo);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ name: 'Remo con Barra', createdBy: 'a3d1c1f0-0000-4000-8000-000000000001' });
    });

    it('responde 400 si la entidad no es válida', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...nuevo, muscleGroup: 'Cuello' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT y DELETE /api/exercises/:id (protegidas)', () => {
    it('PUT sin token responde 401', async () => {
      const res = await request(app).put('/api/exercises/1').send({ reps: 12 });
      expect(res.status).toBe(401);
    });

    it('PUT con token actualiza', async () => {
      const res = await request(app).put('/api/exercises/1').set('Authorization', `Bearer ${token}`).send({ reps: 12 });

      expect(res.status).toBe(200);
      expect(res.body.data.reps).toBe(12);
    });

    it('DELETE con token elimina', async () => {
      const res = await request(app).delete('/api/exercises/1').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(exerciseRepository.items).toHaveLength(0);
    });
  });

  describe('/api/workouts (SQL Server)', () => {
    it('POST sin token responde 401', async () => {
      const res = await request(app).post('/api/workouts').send({ name: 'Full Body', focusMuscle: 'Full Body' });
      expect(res.status).toBe(401);
    });

    it('CRUD completo con token', async () => {
      const auth = { Authorization: `Bearer ${token}` };

      const created = await request(app).post('/api/workouts').set(auth).send({ name: ' Full Body ', focusMuscle: 'Full Body' });
      expect(created.status).toBe(201);
      expect(created.body.data).toMatchObject({ id: 1, name: 'Full Body', durationMinutes: 60 });

      const updated = await request(app).put('/api/workouts/1').set(auth).send({ durationMinutes: 45 });
      expect(updated.status).toBe(200);
      expect(updated.body.data).toMatchObject({ name: 'Full Body', durationMinutes: 45 });

      const list = await request(app).get('/api/workouts');
      expect(list.body.count).toBe(1);

      const deleted = await request(app).delete('/api/workouts/1').set(auth);
      expect(deleted.status).toBe(200);
      expect((await request(app).get('/api/workouts/1')).status).toBe(404);
    });

    it('valida la duración (400)', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cardio', focusMuscle: 'Cardio', durationMinutes: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe('/api/schedules (agenda personal)', () => {
    it('GET sin token responde 401', async () => {
      const res = await request(app).get('/api/schedules');
      expect(res.status).toBe(401);
    });
  });

  it('rutas desconocidas responden 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
