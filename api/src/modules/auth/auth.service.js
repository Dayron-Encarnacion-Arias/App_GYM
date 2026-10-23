const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const config = require('../../config/env');
const AppError = require('../../utils/custom-error');

class AuthService {
  /**
   * Generar Token JWT firmado con expiración configurada
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  /**
   * Registro de un nuevo usuario con hash de contraseña
   */
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new AppError('Todos los campos son obligatorios (nombre, correo y contraseña)', 400);
    }

    if (password.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Verificar si el usuario ya existe (Conflicto 409)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('Ya existe una cuenta registrada con este correo electrónico', 409);
    }

    // Hashear contraseña con bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear y guardar el usuario
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      // El rol lo asigna el servidor: nunca confiar en el valor enviado por el cliente.
      role: 'user',
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      expiresIn: config.jwtExpiresIn,
    };
  }

  /**
   * Inicio de sesión con validación de credenciales
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Por favor proporciona correo y contraseña', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Credenciales incorrectas: Correo o contraseña no válidos', 401);
    }

    // Comparar contraseña hasheada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Credenciales incorrectas: Correo o contraseña no válidos', 401);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      expiresIn: config.jwtExpiresIn,
    };
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return user;
  }
}

module.exports = new AuthService();
