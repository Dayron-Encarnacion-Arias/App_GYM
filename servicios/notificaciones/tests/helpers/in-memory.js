class InMemoryNotificationRepository {
  constructor() {
    this.items = [];
  }

  async createIfNew(notification) {
    if (this.items.some((item) => item.dedupeKey === notification.dedupeKey)) return false;
    this.items.push({ ...notification, id: String(this.items.length + 1), read: false, createdAt: new Date() });
    return true;
  }

  async findByUser(userId) {
    return this.items.filter((item) => item.userId === userId);
  }

  async markAsRead(id, userId) {
    const item = this.items.find((n) => n.id === id && n.userId === userId);
    if (!item) return null;
    item.read = true;
    return item;
  }
}

module.exports = { InMemoryNotificationRepository };
