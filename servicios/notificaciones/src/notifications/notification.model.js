const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    type: { type: String, enum: ['BIENVENIDA'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // Evita duplicados si RabbitMQ entrega el mismo evento más de una vez.
    dedupeKey: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.dedupeKey;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
