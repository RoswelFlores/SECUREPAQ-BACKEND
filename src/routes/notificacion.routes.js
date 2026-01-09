const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const notificacionController = require('../controllers/notificacion.controller');

router.get(
  '/ejecutar-recordatorios',
  verifyToken,
  authorizeRoles('ADMIN'),
  notificacionController.ejecutarRecordatorios
);

module.exports = router;
