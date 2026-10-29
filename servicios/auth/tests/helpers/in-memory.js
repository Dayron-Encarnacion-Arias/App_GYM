const { randomUUID } = require('crypto');
const UserRepositoryPort = require('../../src/domain/user.repository.port');
const EventPublisherPort = require('../../src/domain/event-publisher.port');

class InMemoryUserRepository extends UserRepositoryPort {
  constructor() {
    super();
    this.users = [];
  }

  async findByEmail(email) {
    return this.users.find((user) => user.email === email) || null;
  }

  async findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  async create({ name, email, passwordHash, role }) {
    const user = { id: randomUUID(), name, email, passwordHash, role, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
}

class FakeEventPublisher extends EventPublisherPort {
  constructor({ fail = false } = {}) {
    super();
    this.fail = fail;
    this.published = [];
  }

  async publish(routingKey, payload) {
    if (this.fail) throw new Error('broker caído');
    this.published.push({ routingKey, payload });
  }
}

module.exports = { InMemoryUserRepository, FakeEventPublisher };
