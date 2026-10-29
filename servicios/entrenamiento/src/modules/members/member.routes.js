const { Router } = require('express');
const Member = require('./member.model');
const AppError = require('../../utils/custom-error');

module.exports = function createMemberRouter({ requireAuth }) {
  const router = Router();

  // Perfil de socio creado de forma asíncrona a partir del evento usuario.creado.
  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const member = await Member.findOne({ userId: req.user.id });
      if (!member) throw new AppError('Todavía no existe un perfil de socio para este usuario', 404);
      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
