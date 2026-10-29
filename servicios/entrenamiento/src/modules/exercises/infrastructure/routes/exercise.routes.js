const { Router } = require('express');
const ExerciseController = require('../adapters/exercise.controller');

module.exports = function createExerciseRouter({ exerciseRepository, requireAuth }) {
  const router = Router();
  const exerciseController = new ExerciseController(exerciseRepository);

  // Rutas de consulta (listar y ver por ID)
  router.get('/', (req, res, next) => exerciseController.getAll(req, res, next));
  router.get('/:id', (req, res, next) => exerciseController.getById(req, res, next));

  // Rutas protegidas con JWT (crear, editar, eliminar -> responden 401 sin token)
  router.post('/', requireAuth, (req, res, next) => exerciseController.create(req, res, next));
  router.put('/:id', requireAuth, (req, res, next) => exerciseController.update(req, res, next));
  router.delete('/:id', requireAuth, (req, res, next) => exerciseController.delete(req, res, next));

  return router;
};
