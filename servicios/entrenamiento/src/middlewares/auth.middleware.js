const jwt = require('jsonwebtoken');
const AppError = require('../utils/custom-error');

/**
 * Middleware para validar el JSON Web Token (JWT) emitido por el servicio de auth.
 * Cada servicio verifica la firma con el secreto compartido, sin llamar al servicio
 * de autenticación ni leer su base de datos. Sin token o con token inválido -> 401.
 */
module.exports = function createAuthMiddleware(jwtSecret) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Acceso no autorizado: No se proporcionó un token Bearer', 401));
    }

    try {
      req.user = jwt.verify(authHeader.slice(7).trim(), jwtSecret);
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('El token ha expirado. Inicia sesión nuevamente.', 401));
      }
      return next(new AppError('Token de autenticación no válido o alterado.', 401));
    }
  };
};
