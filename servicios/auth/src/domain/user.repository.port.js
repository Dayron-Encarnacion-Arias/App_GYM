/**
 * Puerto de salida: contrato que debe cumplir cualquier almacenamiento de usuarios.
 * Los casos de uso dependen de este contrato, no de PostgreSQL.
 */
class UserRepositoryPort {
  async findByEmail(email) {
    throw new Error('Método findByEmail no implementado');
  }

  async findById(id) {
    throw new Error('Método findById no implementado');
  }

  async create({ name, email, passwordHash, role }) {
    throw new Error('Método create no implementado');
  }
}

module.exports = UserRepositoryPort;
