const { Router } = require('express');
const scheduleController = require('./schedule.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

// Middleware opcional para extraer token si existe en peticiones GET
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

// Rutas de consulta
router.get('/', optionalAuth, (req, res, next) => scheduleController.getAll(req, res, next));
router.get('/:id', optionalAuth, (req, res, next) => scheduleController.getById(req, res, next));

// Rutas protegidas que requieren JWT (401 si no hay token)
router.post('/', authMiddleware, (req, res, next) => scheduleController.create(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => scheduleController.update(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => scheduleController.delete(req, res, next));

module.exports = router;
