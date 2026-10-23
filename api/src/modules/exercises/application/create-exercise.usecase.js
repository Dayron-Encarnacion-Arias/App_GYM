const Exercise = require('../domain/exercise.entity');
const AppError = require('../../../utils/custom-error');

class CreateExerciseUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  async execute(exerciseData, userId = null) {
    // Validar si ya existe un ejercicio con el mismo nombre (409 Conflict)
    const existing = await this.exerciseRepository.findByName(exerciseData.name);
    if (existing) {
      throw new AppError(
        `Conflicto: Ya existe un ejercicio registrado con el nombre '${exerciseData.name}'`,
        409
      );
    }

    // Instanciar la entidad para que ejecute sus invariantes de dominio
    const exerciseEntity = new Exercise({
      ...exerciseData,
      createdBy: userId,
    });

    return await this.exerciseRepository.create(exerciseEntity);
  }
}

module.exports = CreateExerciseUseCase;
