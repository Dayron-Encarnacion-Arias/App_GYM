const bcrypt = require('bcryptjs');
const AppError = require('../utils/custom-error');
const { normalizeEmail, toPublicUser } = require('../domain/user');

const INVALID_CREDENTIALS = 'Credenciales incorrectas: Correo o contraseña no válidos';

class LoginUserUseCase {
  constructor({ userRepository, tokenService }) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new AppError('Por favor proporciona correo y contraseña', 400);
    }

    const user = await this.userRepository.findByEmail(normalizeEmail(email));
    if (!user) {
      throw new AppError(INVALID_CREDENTIALS, 401);
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      throw new AppError(INVALID_CREDENTIALS, 401);
    }

    const publicUser = toPublicUser(user);
    return {
      user: publicUser,
      token: this.tokenService.sign(publicUser),
      expiresIn: this.tokenService.expiresIn,
    };
  }
}

module.exports = LoginUserUseCase;
