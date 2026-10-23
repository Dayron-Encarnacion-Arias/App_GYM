const Schedule = require('./schedule.model');
const AppError = require('../../utils/custom-error');

class ScheduleController {
  async getAll(req, res, next) {
    try {
      const filter = {};

      // Si el usuario está autenticado, puede ver sus propias rutinas agendadas
      if (req.user && req.user.id) {
        filter.user = req.user.id;
      }

      if (req.query.dayOfWeek) {
        filter.dayOfWeek = req.query.dayOfWeek;
      }

      if (req.query.isRestDay !== undefined) {
        filter.isRestDay = req.query.isRestDay === 'true';
      }

      const schedules = await Schedule.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

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
      const schedule = await Schedule.findById(req.params.id).populate('user', 'name email');
      if (!schedule) {
        throw new AppError(`Agendamiento con id '${req.params.id}' no encontrado`, 404);
      }
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
      } = req.body;

      if (!req.user || !req.user.id) {
        throw new AppError('Acceso no autorizado: Se requiere inicio de sesión', 401);
      }

      // Validar si ya agendó ese mismo día (opcionalmente prevenir duplicados o advertir)
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
      const schedule = await Schedule.findById(req.params.id);
      if (!schedule) {
        throw new AppError(`Agendamiento con id '${req.params.id}' no encontrado`, 404);
      }

      // Verificar que el usuario sea el dueño
      if (req.user && schedule.user.toString() !== req.user.id) {
        throw new AppError('No tienes permisos para modificar este agendamiento', 403);
      }

      const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
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
      const schedule = await Schedule.findById(req.params.id);
      if (!schedule) {
        throw new AppError(`Agendamiento con id '${req.params.id}' no encontrado`, 404);
      }

      if (req.user && schedule.user.toString() !== req.user.id) {
        throw new AppError('No tienes permisos para eliminar este agendamiento', 403);
      }

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
