const { isValidObjectId } = require('mongoose');
const Schedule = require('./schedule.model');
const AppError = require('../../utils/custom-error');

// Campos que el cliente puede modificar; el dueño ("user") nunca se acepta desde el body.
const EDITABLE_FIELDS = [
  'dayOfWeek',
  'routineTitle',
  'focusMuscle',
  'isRestDay',
  'durationMinutes',
  'restIntervalSeconds',
  'targetExercises',
  'notes',
  'status',
];

function pickEditable(body = {}) {
  return Object.fromEntries(EDITABLE_FIELDS.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
}

/**
 * Busca un agendamiento del usuario autenticado. Si no existe o es de otra
 * persona responde 404, para no revelar agendamientos ajenos.
 */
async function findOwnedSchedule(id, userId) {
  const schedule = isValidObjectId(id) ? await Schedule.findOne({ _id: id, user: userId }) : null;
  if (!schedule) {
    throw new AppError(`Agendamiento con id '${id}' no encontrado`, 404);
  }
  return schedule;
}

class ScheduleController {
  async getAll(req, res, next) {
    try {
      // Cada usuario solo ve su propia agenda.
      const filter = { user: req.user.id };

      if (req.query.dayOfWeek) {
        filter.dayOfWeek = String(req.query.dayOfWeek);
      }

      if (req.query.isRestDay !== undefined) {
        filter.isRestDay = req.query.isRestDay === 'true';
      }

      const schedules = await Schedule.find(filter).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const schedule = await findOwnedSchedule(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const {
        dayOfWeek,
        routineTitle,
        focusMuscle,
        isRestDay,
        durationMinutes,
        restIntervalSeconds,
        targetExercises,
        notes,
      } = req.body || {};

      if (typeof routineTitle !== 'string' || !routineTitle.trim()) {
        throw new AppError('El título de la rutina es obligatorio', 400);
      }

      const existingSameDay = await Schedule.findOne({
        user: req.user.id,
        dayOfWeek,
        routineTitle: routineTitle.trim(),
      });

      if (existingSameDay) {
        throw new AppError(
          `Conflicto: Ya tienes una rutina agendada para el día '${dayOfWeek}' con el título '${routineTitle}'`,
          409
        );
      }

      const schedule = await Schedule.create({
        user: req.user.id,
        dayOfWeek,
        routineTitle: routineTitle.trim(),
        focusMuscle: isRestDay ? 'Descanso' : focusMuscle,
        isRestDay: Boolean(isRestDay),
        durationMinutes: isRestDay ? 0 : Number(durationMinutes || 60),
        restIntervalSeconds: Number(restIntervalSeconds || 60),
        targetExercises: Array.isArray(targetExercises) ? targetExercises : [],
        notes: notes || '',
      });

      res.status(201).json({
        success: true,
        message: isRestDay
          ? `Día de descanso agendado para el ${dayOfWeek}`
          : `Rutina '${routineTitle}' agendada para el ${dayOfWeek}`,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      await findOwnedSchedule(req.params.id, req.user.id);

      const updated = await Schedule.findByIdAndUpdate(req.params.id, pickEditable(req.body), {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: 'Agendamiento actualizado correctamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await findOwnedSchedule(req.params.id, req.user.id);
      await Schedule.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Agendamiento eliminado correctamente',
        data: { id: req.params.id },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
