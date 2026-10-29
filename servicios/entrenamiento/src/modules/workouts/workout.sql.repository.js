const sql = require('mssql');
const AppError = require('../../utils/custom-error');

const SELECT_COLUMNS =
  'Id AS id, Name AS name, FocusMuscle AS focusMuscle, Description AS description, DurationMinutes AS durationMinutes, CreatedAt AS createdAt';
const OUTPUT_COLUMNS =
  'INSERTED.Id AS id, INSERTED.Name AS name, INSERTED.FocusMuscle AS focusMuscle, INSERTED.Description AS description, INSERTED.DurationMinutes AS durationMinutes, INSERTED.CreatedAt AS createdAt';

function bind(request, workout) {
  request.input('name', sql.NVarChar(100), workout.name);
  request.input('focusMuscle', sql.NVarChar(60), workout.focusMuscle);
  request.input('description', sql.NVarChar(500), workout.description || null);
  request.input('durationMinutes', sql.Int, workout.durationMinutes);
  return request;
}

/**
 * Persistencia de rutinas en SQL Server con consultas parametrizadas.
 * Si SQL Server no está disponible responde 503 en lugar de tumbar el servicio.
 */
class WorkoutSqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  request() {
    if (!this.pool.connected) {
      throw new AppError('SQL Server no está disponible en este momento', 503);
    }
    return this.pool.request();
  }

  async findAll() {
    const result = await this.request().query(`SELECT ${SELECT_COLUMNS} FROM dbo.Workouts ORDER BY Id DESC`);
    return result.recordset;
  }

  async findById(id) {
    const result = await this.request().input('id', sql.Int, id).query(`SELECT ${SELECT_COLUMNS} FROM dbo.Workouts WHERE Id = @id`);
    return result.recordset[0] || null;
  }

  async create(workout) {
    const result = await bind(this.request(), workout).query(
      `INSERT INTO dbo.Workouts (Name, FocusMuscle, Description, DurationMinutes) OUTPUT ${OUTPUT_COLUMNS} VALUES (@name, @focusMuscle, @description, @durationMinutes)`
    );
    return result.recordset[0];
  }

  async update(id, workout) {
    const result = await bind(this.request(), workout)
      .input('id', sql.Int, id)
      .query(
        `UPDATE dbo.Workouts SET Name=@name, FocusMuscle=@focusMuscle, Description=@description, DurationMinutes=@durationMinutes OUTPUT ${OUTPUT_COLUMNS} WHERE Id=@id`
      );
    return result.recordset[0] || null;
  }

  async delete(id) {
    const result = await this.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Workouts OUTPUT DELETED.Id AS id, DELETED.Name AS name WHERE Id=@id');
    return result.recordset[0] || null;
  }
}

module.exports = WorkoutSqlRepository;
