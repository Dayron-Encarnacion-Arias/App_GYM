const { Router } = require('express');
const AppError = require('../utils/custom-error');

module.exports = function createNotificationRouter({ notificationRepository, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const notifications = await notificationRepository.findByUser(req.user.id);
      res.json({
        success: true,
        count: notifications.length,
        unread: notifications.filter((item) => !item.read).length,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/read', async (req, res, next) => {
    try {
      const notification = await notificationRepository.markAsRead(req.params.id, req.user.id);
      if (!notification) throw new AppError('Notificación no encontrada', 404);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
