const { Router } = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

// Rutas públicas de autenticación
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Ruta protegida con JWT
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

module.exports = router;
