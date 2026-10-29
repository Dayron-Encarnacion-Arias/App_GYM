const jwt = require('jsonwebtoken');
const ExerciseRepositoryPort = require('../../src/modules/exercises/domain/exercise.repository.port');

const JWT_SECRET = 'test-secret';

class InMemoryExerciseRepository extends ExerciseRepositoryPort {
  constructor(seed = []) {
    super();
    this.items = [];
    this.nextId = 1;
    seed.forEach((item) => this.items.push({ ...item, id: String(this.nextId++) }));
  }

  async findAll({ muscleGroup, difficulty, search } = {}) {
    return this.items.filter(
      (item) =>
        (!muscleGroup || item.muscleGroup === muscleGroup) &&
        (!difficulty || item.difficulty === difficulty) &&
        (!search || item.name.toLowerCase().includes(search.toLowerCase()))
    );
  }

  async findById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  async findByName(name) {
    return this.items.find((item) => item.name.toLowerCase() === String(name).trim().toLowerCase()) || null;
  }

  async create(entity) {
    const created = { ...entity.toObject(), id: String(this.nextId++) };
    this.items.push(created);
    return created;
  }

  async update(id, data) {
    const index = this.items.findIndex((item) => item.id === id);
    this.items[index] = { ...this.items[index], ...data, id };
    return this.items[index];
  }

  async delete(id) {
    const before = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < before;
  }
}

class InMemoryWorkoutRepository {
  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  async findAll() {
    return [...this.items].reverse();
  }

  async findById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  async create(workout) {
    const created = { id: this.nextId++, description: null, ...workout, createdAt: new Date().toISOString() };
    this.items.push(created);
    return created;
  }

  async update(id, workout) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...workout };
    return this.items[index];
  }

  async delete(id) {
    const found = await this.findById(id);
    this.items = this.items.filter((item) => item.id !== id);
    return found ? { id: found.id, name: found.name } : null;
  }
}

function signToken(payload = {}) {
  return jwt.sign({ id: 'a3d1c1f0-0000-4000-8000-000000000001', email: 'ana@gym.com', name: 'Ana', role: 'user', ...payload }, JWT_SECRET, {
    expiresIn: '1h',
  });
}

module.exports = { InMemoryExerciseRepository, InMemoryWorkoutRepository, signToken, JWT_SECRET };
