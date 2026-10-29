const { isValidObjectId } = require('mongoose');
const Notification = require('./notification.model');

class NotificationMongoRepository {
  async createIfNew(notification) {
    const result = await Notification.updateOne(
      { dedupeKey: notification.dedupeKey },
      { $setOnInsert: notification },
      { upsert: true }
    );
    return result.upsertedCount === 1;
  }

  async findByUser(userId) {
    const docs = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return docs.map((doc) => doc.toJSON());
  }

  async markAsRead(id, userId) {
    if (!isValidObjectId(id)) return null;
    const doc = await Notification.findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true });
    return doc ? doc.toJSON() : null;
  }
}

module.exports = NotificationMongoRepository;
