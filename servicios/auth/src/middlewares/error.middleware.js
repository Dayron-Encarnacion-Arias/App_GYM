const AppError = require('../utils/custom-error');
const config = require('../config/env');

// Códigos de PostgreSQL: 23505 = valor único duplicado, 22P02 = formato inválido (p. ej. UUID).
module.exports = (error, req, res, next) => {
  let normalized = error;
  if (error.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    normalized = new AppError('El cuerpo JSON no es válido', 400);
  } else if (error.code === '23505') {
    normalized = new AppError('Ya existe una cuenta registrada con este correo electrónico', 409);
  } else if (error.code === '22P02') {
    normalized = new AppError('Identificador no válido', 400);
  } else if (!(error instanceof AppError)) {
    normalized = new AppError('Error interno del servidor', 500);
  }

  if (normalized.statusCode >= 500) console.error(error);
  res.status(normalized.statusCode || 500).json({
    success: false,
    message: normalized.message,
    ...(config.nodeEnv === 'development' && normalized.statusCode >= 500 ? { detail: error.message } : {}),
  });
};
