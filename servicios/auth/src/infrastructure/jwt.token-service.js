const jwt = require('jsonwebtoken');

class JwtTokenService {
  constructor({ secret, expiresIn }) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtTokenService;
