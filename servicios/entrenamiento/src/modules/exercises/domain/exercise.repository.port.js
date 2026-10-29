/**
 * Puerto del Repositorio de Ejercicios (Puerto de Salida / Driven Port)
 * Define el contrato que debe satisfacer cualquier adaptador de persistencia
 * (sea MongoDB, SQL Server, Memoria o un servicio externo).
 */
class ExerciseRepositoryPort {
  /**
   * @param {{ muscleGroup?: string, difficulty?: string, search?: string }} criteria
   */
  async findAll(criteria = {}) {
    throw new Error('Método findAll no implementado');
  }

  async findById(id) {
    throw new Error('Método findById no implementado');
  }

  async findByName(name) {
    throw new Error('Método findByName no implementado');
  }

  async create(exerciseEntity) {
    throw new Error('Método create no implementado');
  }

  async update(id, exerciseData) {
    throw new Error('Método update no implementado');
  }

  async delete(id) {
    throw new Error('Método delete no implementado');
  }
}

module.exports = ExerciseRepositoryPort;
