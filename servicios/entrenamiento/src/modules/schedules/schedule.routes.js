const { Router } = require('express');
const scheduleController = require('./schedule.controller');

/**
 * La agenda es información personal: todas las rutas requieren JWT (401 sin token).
 */
module.exports = function createScheduleRouter({ requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', (req, res, next) => scheduleController.getAll(req, res, next));
  router.get('/:id', (req, res, next) => scheduleController.getById(req, res, next));
  router.post('/', (req, res, next) => scheduleController.create(req, res, next));
  router.put('/:id', (req, res, next) => scheduleController.update(req, res, next));
  router.delete('/:id', (req, res, next) => scheduleController.delete(req, res, next));

  return router;
};
