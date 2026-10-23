const ExerciseRepositoryPort = require('../../domain/exercise.repository.port');
const ExerciseModel = require('./exercise.mongo.model');

/**
 * Adaptador Secundario (Driven Adapter) para MongoDB
 * Implementa el puerto del repositorio de dominio interactuando con Mongoose.
 */
class ExerciseMongoRepository extends ExerciseRepositoryPort {
  _mapToDomain(doc) {
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      muscleGroup: doc.muscleGroup,
      description: doc.description,
      difficulty: doc.difficulty,
      sets: doc.sets,
      reps: doc.reps,
      restSeconds: doc.restSeconds,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(filter = {}) {
    const docs = await ExerciseModel.find(filter).sort({ createdAt: -1 });
    return docs.map(this._mapToDomain);
  }

  async findById(id) {
    const doc = await ExerciseModel.findById(id);
    return this._mapToDomain(doc);
  }

  async findByName(name) {
    if (!name) return null;
    const doc = await ExerciseModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    return this._mapToDomain(doc);
  }

  async create(exerciseEntity) {
    const doc = await ExerciseModel.create({
      name: exerciseEntity.name.trim(),
      muscleGroup: exerciseEntity.muscleGroup,
      description: exerciseEntity.description,
      difficulty: exerciseEntity.difficulty,
      sets: exerciseEntity.sets,
      reps: exerciseEntity.reps,
      restSeconds: exerciseEntity.restSeconds,
      createdBy: exerciseEntity.createdBy,
    });
    return this._mapToDomain(doc);
  }

  async update(id, exerciseData) {
    const doc = await ExerciseModel.findByIdAndUpdate(
      id,
      {
        name: exerciseData.name ? exerciseData.name.trim() : undefined,
        muscleGroup: exerciseData.muscleGroup,
        description: exerciseData.description,
        difficulty: exerciseData.difficulty,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        restSeconds: exerciseData.restSeconds,
      },
      { new: true, runValidators: true }
    );
    return this._mapToDomain(doc);
  }

  async delete(id) {
    const res = await ExerciseModel.findByIdAndDelete(id);
    return !!res;
  }
}

module.exports = ExerciseMongoRepository;
