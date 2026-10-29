const { Router } = require('express');
const WorkoutController = require('./workout.controller');

module.exports = function createWorkoutRouter({ workoutRepository, requireAuth }) {
  const router = Router();
  const controller = new WorkoutController(workoutRepository);

  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.post('/', requireAuth, (req, res, next) => controller.create(req, res, next));
  router.put('/:id', requireAuth, (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', requireAuth, (req, res, next) => controller.delete(req, res, next));
  return router;
};
