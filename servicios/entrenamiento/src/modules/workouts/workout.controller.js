const AppError = require('../../utils/custom-error');

const fields = ['name', 'focusMuscle', 'description', 'durationMinutes'];

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new AppError('El id debe ser un entero positivo', 400);
  return id;
}

/**
 * Valida y normaliza el cuerpo. Devuelve un objeto nuevo con solo los campos permitidos.
 */
function validatePayload(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError('El cuerpo JSON no es válido', 400);
  if (!partial && (!body.name || !body.focusMuscle)) throw new AppError('name y focusMuscle son obligatorios', 400);
  const clean = {};
  for (const key of fields) {
    if (body[key] === undefined || body[key] === null) continue;
    if (key === 'durationMinutes') {
      const duration = Number(body[key]);
      if (!Number.isInteger(duration) || duration < 1 || duration > 600) throw new AppError('durationMinutes debe ser un entero entre 1 y 600', 400);
      clean[key] = duration;
    } else if (typeof body[key] !== 'string' || (key !== 'description' && !body[key].trim())) {
      throw new AppError(`${key} debe ser texto${key !== 'description' ? ' y no puede estar vacío' : ''}`, 400);
    } else {
      clean[key] = body[key].trim();
    }
  }
  return clean;
}

class WorkoutController {
  constructor(repository) {
    this.repository = repository;
  }

  async list(req, res, next) {
    try {
      const workouts = await this.repository.findAll();
      res.json({ success: true, count: workouts.length, data: workouts });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const id = parseId(req.params.id);
      const workout = await this.repository.findById(id);
      if (!workout) throw new AppError(`Rutina ${id} no encontrada`, 404);
      res.json({ success: true, data: workout });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const workout = { durationMinutes: 60, ...validatePayload(req.body) };
      const created = await this.repository.create(workout);
      res.status(201).json({ success: true, message: `Rutina '${created.name}' creada`, data: created });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const id = parseId(req.params.id);
      const changes = validatePayload(req.body, true);
      const current = await this.repository.findById(id);
      if (!current) throw new AppError(`Rutina ${id} no encontrada`, 404);
      const values = validatePayload({ ...current, ...changes });
      const updated = await this.repository.update(id, values);
      res.json({ success: true, message: `Rutina '${updated.name}' actualizada`, data: updated });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const id = parseId(req.params.id);
      const deleted = await this.repository.delete(id);
      if (!deleted) throw new AppError(`Rutina ${id} no encontrada`, 404);
      res.json({ success: true, message: `Rutina '${deleted.name}' eliminada`, data: deleted });
    } catch (error) { next(error); }
  }
}

module.exports = WorkoutController;
