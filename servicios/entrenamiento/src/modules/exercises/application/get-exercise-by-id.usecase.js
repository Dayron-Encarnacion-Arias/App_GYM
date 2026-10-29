const AppError = require('../../../utils/custom-error');

class GetExerciseByIdUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  async execute(id) {
    if (!id) {
      throw new AppError('El id del ejercicio es obligatorio', 400);
    }

    const exercise = await this.exerciseRepository.findById(id);
    if (!exercise) {
      throw new AppError(`Ejercicio con id '${id}' no encontrado`, 404);
    }

    return exercise;
  }
}

module.exports = GetExerciseByIdUseCase;
