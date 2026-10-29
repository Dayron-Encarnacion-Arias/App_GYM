const Exercise = require('../domain/exercise.entity');
const AppError = require('../../../utils/custom-error');

class UpdateExerciseUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  async execute(id, updateData) {
    if (!id) {
      throw new AppError('El id del ejercicio es obligatorio', 400);
    }

    const current = await this.exerciseRepository.findById(id);
    if (!current) {
      throw new AppError(`Ejercicio con id '${id}' no encontrado para actualizar`, 404);
    }

    // Si se modifica el nombre, verificar que no colisione con otro
    if (updateData.name && updateData.name !== current.name) {
      const duplicate = await this.exerciseRepository.findByName(updateData.name);
      if (duplicate && duplicate.id !== id) {
        throw new AppError(
          `Conflicto: Ya existe otro ejercicio con el nombre '${updateData.name}'`,
          409
        );
      }
    }

    // Validar datos fusionados a través de la entidad
    const mergedData = {
      ...current,
      ...updateData,
      id,
      updatedAt: new Date(),
    };

    const validatedEntity = new Exercise(mergedData);

    return await this.exerciseRepository.update(id, validatedEntity.toObject());
  }
}

module.exports = UpdateExerciseUseCase;
