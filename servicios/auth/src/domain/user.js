const AppError = require('../utils/custom-error');

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.toLowerCase().trim() : '';
}

/**
 * Reglas de negocio del registro, independientes de Express y de la base de datos.
 */
function validateRegistration({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError('Todos los campos son obligatorios (nombre, correo y contraseña)', 400);
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    throw new AppError('El nombre debe tener entre 2 y 100 caracteres', 400);
  }
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) {
    throw new AppError('Por favor ingresa un correo electrónico válido', 400);
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
  }
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { normalizeEmail, validateRegistration, toPublicUser };
