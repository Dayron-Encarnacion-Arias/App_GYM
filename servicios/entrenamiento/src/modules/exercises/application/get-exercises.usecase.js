class GetExercisesUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  /**
   * Traduce los parámetros de consulta a criterios de dominio. Cómo se convierten
   * en una consulta concreta (regex de Mongo, LIKE de SQL...) lo decide el adaptador.
   */
  async execute(queryParams = {}) {
    const criteria = {};

    if (typeof queryParams.muscleGroup === 'string' && queryParams.muscleGroup.trim()) {
      criteria.muscleGroup = queryParams.muscleGroup.trim();
    }

    if (typeof queryParams.difficulty === 'string' && queryParams.difficulty.trim()) {
      criteria.difficulty = queryParams.difficulty.trim();
    }

    if (typeof queryParams.search === 'string' && queryParams.search.trim()) {
      criteria.search = queryParams.search.trim();
    }

    return await this.exerciseRepository.findAll(criteria);
  }
}

module.exports = GetExercisesUseCase;
