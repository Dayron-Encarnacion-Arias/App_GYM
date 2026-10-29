const AppError = require('../utils/custom-error');

/**
 * Valida el JWT del header Authorization (Bearer). Sin token o con token
 * inválido responde 401.
 */
module.exports = function createAuthMiddleware(tokenService) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Acceso no autorizado: No se proporcionó un token Bearer', 401));
    }

    try {
      req.user = tokenService.verify(authHeader.slice(7).trim());
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('El token ha expirado. Inicia sesión nuevamente.', 401));
      }
      return next(new AppError('Token de autenticación no válido o alterado.', 401));
    }
  };
};
