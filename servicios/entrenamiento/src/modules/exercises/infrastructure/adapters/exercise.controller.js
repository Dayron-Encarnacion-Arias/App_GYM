const CreateExerciseUseCase = require('../../application/create-exercise.usecase');
const GetExercisesUseCase = require('../../application/get-exercises.usecase');
const GetExerciseByIdUseCase = require('../../application/get-exercise-by-id.usecase');
const UpdateExerciseUseCase = require('../../application/update-exercise.usecase');
const DeleteExerciseUseCase = require('../../application/delete-exercise.usecase');

/**
 * Adaptador Primario (Driving Adapter) para HTTP Express
 * Convierte peticiones HTTP en llamadas a los casos de uso de la capa de aplicación.
 * Recibe el repositorio por constructor: en producción es el adaptador de MongoDB
 * y en las pruebas un repositorio en memoria.
 */
class ExerciseController {
  constructor(repository) {
    this.createExerciseUseCase = new CreateExerciseUseCase(repository);
    this.getExercisesUseCase = new GetExercisesUseCase(repository);
    this.getExerciseByIdUseCase = new GetExerciseByIdUseCase(repository);
    this.updateExerciseUseCase = new UpdateExerciseUseCase(repository);
    this.deleteExerciseUseCase = new DeleteExerciseUseCase(repository);
  }

  async getAll(req, res, next) {
    try {
      const exercises = await this.getExercisesUseCase.execute(req.query);
      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const exercise = await this.getExerciseByIdUseCase.execute(req.params.id);
      res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const created = await this.createExerciseUseCase.execute(req.body || {}, userId);
      res.status(201).json({
        success: true,
        message: 'Ejercicio creado exitosamente',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await this.updateExerciseUseCase.execute(req.params.id, req.body || {});
      res.status(200).json({
        success: true,
        message: 'Ejercicio actualizado exitosamente',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await this.deleteExerciseUseCase.execute(req.params.id);
      res.status(200).json({
        success: true,
        message: `Ejercicio '${result.name}' eliminado exitosamente`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExerciseController;
