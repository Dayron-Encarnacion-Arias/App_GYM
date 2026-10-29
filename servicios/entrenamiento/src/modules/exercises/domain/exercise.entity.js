const AppError = require('../../../utils/custom-error');

/**
 * Entidad de Dominio: Exercise
 * Contiene las reglas de negocio e invariantes del ejercicio,
 * completamente independiente de librerías de persistencia o frameworks HTTP.
 */
class Exercise {
  constructor({
    id,
    name,
    muscleGroup,
    description = '',
    difficulty = 'Intermedio',
    sets = 3,
    reps = 10,
    restSeconds = 60,
    createdBy = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.muscleGroup = muscleGroup;
    this.description = description;
    this.difficulty = difficulty;
    this.sets = Number(sets);
    this.reps = Number(reps);
    this.restSeconds = Number(restSeconds);
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new AppError('El nombre del ejercicio es obligatorio y debe tener al menos 2 caracteres', 400);
    }

    const validMuscleGroups = [
      'Pecho',
      'Espalda',
      'Piernas',
      'Brazos',
      'Hombros',
      'Core',
      'Full Body',
      'Cardio',
    ];
    if (!this.muscleGroup || !validMuscleGroups.includes(this.muscleGroup)) {
      throw new AppError(
        `Grupo muscular no válido. Debe ser uno de: ${validMuscleGroups.join(', ')}`,
        400
      );
    }

    const validDifficulties = ['Principiante', 'Intermedio', 'Avanzado'];
    if (this.difficulty && !validDifficulties.includes(this.difficulty)) {
      throw new AppError(
        `Nivel de dificultad no válido. Debe ser uno de: ${validDifficulties.join(', ')}`,
        400
      );
    }

    if (isNaN(this.sets) || this.sets < 1 || this.sets > 50) {
      throw new AppError('Las series deben ser un número entre 1 y 50', 400);
    }

    if (isNaN(this.reps) || this.reps < 1 || this.reps > 500) {
      throw new AppError('Las repeticiones deben ser un número entre 1 y 500', 400);
    }

    if (isNaN(this.restSeconds) || this.restSeconds < 0 || this.restSeconds > 600) {
      throw new AppError('El tiempo de descanso debe estar entre 0 y 600 segundos', 400);
    }
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      muscleGroup: this.muscleGroup,
      description: this.description,
      difficulty: this.difficulty,
      sets: this.sets,
      reps: this.reps,
      restSeconds: this.restSeconds,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Exercise;
