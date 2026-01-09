const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware')
const conserjeriaController = require('../controllers/conserjeria.controller');

router.get(
  '/dashboard',
  verifyToken,
  authorizeRoles('CONSERJERIA', 'ADMIN'),
  conserjeriaController.obtenerDashboard
);

router.get(
  '/encomiendas',
  verifyToken,
  authorizeRoles('CONSERJERIA', 'ADMIN'),
  conserjeriaController.obtenerListado
);

module.exports = router;