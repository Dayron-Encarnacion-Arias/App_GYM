const AppError = require('../utils/custom-error');
const config = require('../config/env');

module.exports = (error, req, res, next) => {
  let normalized = error;
  if (error.name === 'ValidationError' || error.name === 'CastError' || error instanceof SyntaxError) {
    normalized = new AppError(error.message || 'Solicitud no válida', 400);
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
