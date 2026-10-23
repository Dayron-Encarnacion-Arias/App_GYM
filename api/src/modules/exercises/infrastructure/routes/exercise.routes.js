const { Router } = require('express');
const exerciseController = require('../adapters/exercise.controller');
const authMiddleware = require('../../../../middlewares/auth.middleware');

const router = Router();

// Rutas de consulta (listar y ver por ID)
router.get('/', (req, res, next) => exerciseController.getAll(req, res, next));
router.get('/:id', (req, res, next) => exerciseController.getById(req, res, next));

// Rutas protegidas con JWT (crear, editar, eliminar -> responden 401 sin token)
router.post('/', authMiddleware, (req, res, next) => exerciseController.create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => exerciseController.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => exerciseController.delete(req, res, next));

module.exports = router;
