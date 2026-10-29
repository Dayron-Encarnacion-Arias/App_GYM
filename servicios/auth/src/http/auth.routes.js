const { Router } = require('express');
const createAuthMiddleware = require('../middlewares/auth.middleware');

/**
 * Adaptador primario HTTP: traduce peticiones Express a casos de uso.
 */
module.exports = function createAuthRouter({ registerUser, loginUser, getProfile, tokenService }) {
  const router = Router();
  const requireAuth = createAuthMiddleware(tokenService);

  router.post('/register', async (req, res, next) => {
    try {
      const data = await registerUser.execute(req.body || {});
      res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', data });
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const data = await loginUser.execute(req.body || {});
      res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', data });
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const data = await getProfile.execute(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
