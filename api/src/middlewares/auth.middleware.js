const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/custom-error');

/**
 * Middleware para validar el JSON Web Token (JWT)
 * Extrae el Bearer token del header Authorization
 * Si falta o es inválido, responde con código 401 Unauthorized
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Acceso no autorizado: No se proporcionó un token Bearer', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Acceso no autorizado: Token ausente', 401));
    }

    // Verificar token con el secreto
    const decoded = jwt.verify(token, config.jwtSecret);

    // Inyectar datos del usuario decodificado en el objeto request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('El token ha expirado. Inicia sesión nuevamente.', 401));
    }
    return next(new AppError('Token de autenticación no válido o alterado.', 401));
  }
};

module.exports = authMiddleware;
