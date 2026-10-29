const Member = require('./member.model');
const Schedule = require('../schedules/schedule.model');
const { buildStarterPlan } = require('../../utils/seeder');

/**
 * Reacción al evento usuario.creado publicado por el servicio de autenticación:
 * 1. Registra al usuario como socio en la base de datos de este servicio.
 * 2. Le crea un plan semanal de bienvenida en su agenda.
 *
 * Es idempotente: si RabbitMQ entrega el mismo mensaje dos veces no se duplica nada.
 */
module.exports = async function handleUserCreated(message) {
  const user = message && message.data;
  if (!user || !user.id || !user.email) {
    throw new Error('Mensaje usuario.creado sin datos de usuario');
  }

  const member = await Member.findOneAndUpdate(
    { userId: user.id },
    { $setOnInsert: { userId: user.id, name: user.name, email: user.email, joinedAt: user.createdAt || new Date() } },
    { upsert: true, new: true }
  );

  if (member.starterPlanCreated) {
    console.log(`[entrenamiento] usuario.creado repetido para ${user.email}, se ignora`);
    return;
  }

  const hasSchedules = await Schedule.exists({ user: user.id });
  if (!hasSchedules) {
    await Schedule.insertMany(buildStarterPlan(user.id));
  }
  await Member.updateOne({ userId: user.id }, { $set: { starterPlanCreated: true } });
  console.log(`[entrenamiento] Socio registrado y plan de bienvenida creado para ${user.email}`);
};
