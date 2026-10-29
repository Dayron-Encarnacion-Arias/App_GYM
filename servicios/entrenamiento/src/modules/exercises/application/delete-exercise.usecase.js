const AppError = require('../../../utils/custom-error');

class DeleteExerciseUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  async execute(id) {
    if (!id) {
      throw new AppError('El id del ejercicio es obligatorio', 400);
    }

    const current = await this.exerciseRepository.findById(id);
    if (!current) {
      throw new AppError(`Ejercicio con id '${id}' no encontrado para eliminar`, 404);
    }

    const success = await this.exerciseRepository.delete(id);
    return {
      deleted: success,
      id,
      name: current.name,
    };
  }
}

module.exports = DeleteExerciseUseCase;
