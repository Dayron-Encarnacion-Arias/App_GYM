const AppError = require('../utils/custom-error');
const { toPublicUser } = require('../domain/user');

class GetProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return toPublicUser(user);
  }
}

module.exports = GetProfileUseCase;
