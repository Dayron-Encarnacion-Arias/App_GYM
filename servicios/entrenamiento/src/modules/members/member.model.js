const mongoose = require('mongoose');

/**
 * Copia local (de solo lectura) de los datos públicos del usuario. Se llena con
 * el evento usuario.creado: así este servicio conoce a sus socios sin consultar
 * la base de datos del servicio de autenticación.
 */
const memberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    joinedAt: { type: Date, default: Date.now },
    starterPlanCreated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Member', memberSchema);
