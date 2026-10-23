const { Router } = require('express');
const controller = require('./workout.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', auth, (req, res, next) => controller.create(req, res, next));
router.put('/:id', auth, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', auth, (req, res, next) => controller.delete(req, res, next));
module.exports = router;
