const UserRepositoryPort = require('../domain/user.repository.port');

const COLUMNS = 'id, name, email, password_hash, role, created_at';

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

/**
 * Adaptador secundario: implementa el puerto de usuarios sobre PostgreSQL.
 * Esta base de datos pertenece solo al servicio de autenticación.
 */
class UserPostgresRepository extends UserRepositoryPort {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query(`SELECT ${COLUMNS} FROM users WHERE email = $1`, [email]);
    return mapRow(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
    return mapRow(rows[0]);
  }

  async create({ name, email, passwordHash, role }) {
    const { rows } = await this.pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [name, email, passwordHash, role]
    );
    return mapRow(rows[0]);
  }
}

module.exports = UserPostgresRepository;
