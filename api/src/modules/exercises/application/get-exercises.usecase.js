class GetExercisesUseCase {
  constructor(exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  async execute(queryParams = {}) {
    const filter = {};

    if (queryParams.muscleGroup) {
      filter.muscleGroup = queryParams.muscleGroup;
    }

    if (queryParams.difficulty) {
      filter.difficulty = queryParams.difficulty;
    }

    if (queryParams.search) {
      filter.name = { $regex: queryParams.search, $options: 'i' };
    }

    return await this.exerciseRepository.findAll(filter);
  }
}

module.exports = GetExercisesUseCase;
