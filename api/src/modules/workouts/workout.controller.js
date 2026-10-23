const AppError = require('../../utils/custom-error');
const { pool, sql } = require('../../config/sqlserver');

const fields = ['name', 'focusMuscle', 'description', 'durationMinutes'];
function validatePayload(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError('El cuerpo JSON no es válido', 400);
  if (!partial && (!body.name || !body.focusMuscle)) throw new AppError('name y focusMuscle son obligatorios', 400);
  for (const key of fields) {
    if (body[key] === undefined) continue;
    if (key === 'durationMinutes') {
      const duration = Number(body[key]);
      if (!Number.isInteger(duration) || duration < 1 || duration > 600) throw new AppError('durationMinutes debe ser un entero entre 1 y 600', 400);
      body[key] = duration;
    } else if (typeof body[key] !== 'string' || (key !== 'description' && !body[key].trim())) {
      throw new AppError(`${key} debe ser texto${key !== 'description' ? ' y no puede estar vacío' : ''}`, 400);
    }
  }
}

function bind(request, body) {
  request.input('name', sql.NVarChar(100), body.name?.trim());
  request.input('focusMuscle', sql.NVarChar(60), body.focusMuscle?.trim());
  request.input('description', sql.NVarChar(500), body.description?.trim() || null);
  request.input('durationMinutes', sql.Int, body.durationMinutes ?? 60);
  return request;
}

class WorkoutController {
  async list(req, res, next) {
    try {
      const result = await pool.request().query('SELECT Id AS id, Name AS name, FocusMuscle AS focusMuscle, Description AS description, DurationMinutes AS durationMinutes, CreatedAt AS createdAt FROM dbo.Workouts ORDER BY Id DESC');
      res.json({ success: true, count: result.recordset.length, data: result.recordset });
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) throw new AppError('El id debe ser un entero positivo', 400);
      const result = await pool.request().input('id', sql.Int, id).query('SELECT Id AS id, Name AS name, FocusMuscle AS focusMuscle, Description AS description, DurationMinutes AS durationMinutes, CreatedAt AS createdAt FROM dbo.Workouts WHERE Id = @id');
      if (!result.recordset[0]) throw new AppError(`Rutina ${id} no encontrada`, 404);
      res.json({ success: true, data: result.recordset[0] });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      validatePayload(req.body);
      const result = await bind(pool.request(), req.body).query('INSERT INTO dbo.Workouts (Name, FocusMuscle, Description, DurationMinutes) OUTPUT INSERTED.Id AS id, INSERTED.Name AS name, INSERTED.FocusMuscle AS focusMuscle, INSERTED.Description AS description, INSERTED.DurationMinutes AS durationMinutes, INSERTED.CreatedAt AS createdAt VALUES (@name, @focusMuscle, @description, @durationMinutes)');
      res.status(201).json({ success: true, data: result.recordset[0] });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) throw new AppError('El id debe ser un entero positivo', 400);
      validatePayload(req.body, true);
      const current = await pool.request().input('id', sql.Int, id).query('SELECT Id AS id, Name AS name, FocusMuscle AS focusMuscle, Description AS description, DurationMinutes AS durationMinutes FROM dbo.Workouts WHERE Id = @id');
      if (!current.recordset[0]) throw new AppError(`Rutina ${id} no encontrada`, 404);
      const values = { ...current.recordset[0], ...req.body };
      validatePayload(values);
      const result = await bind(pool.request(), values).input('id', sql.Int, id).query('UPDATE dbo.Workouts SET Name=@name, FocusMuscle=@focusMuscle, Description=@description, DurationMinutes=@durationMinutes OUTPUT INSERTED.Id AS id, INSERTED.Name AS name, INSERTED.FocusMuscle AS focusMuscle, INSERTED.Description AS description, INSERTED.DurationMinutes AS durationMinutes, INSERTED.CreatedAt AS createdAt WHERE Id=@id');
      res.json({ success: true, data: result.recordset[0] });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) throw new AppError('El id debe ser un entero positivo', 400);
      const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.Workouts OUTPUT DELETED.Id AS id, DELETED.Name AS name WHERE Id=@id');
      if (!result.recordset[0]) throw new AppError(`Rutina ${id} no encontrada`, 404);
      res.json({ success: true, data: result.recordset[0] });
    } catch (error) { next(error); }
  }
}

module.exports = new WorkoutController();
