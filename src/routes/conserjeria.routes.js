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

router.get(
  '/residentes',
  verifyToken,
  authorizeRoles('CONSERJERIA', 'ADMIN'),
  conserjeriaController.buscarResidentes
);

router.get(
  '/residentes-lista',
  verifyToken,
  authorizeRoles('CONSERJERIA', 'ADMIN'),
  conserjeriaController.listarResidentesConDepartamento
);

router.get(
  '/couriers',
  verifyToken,
  authorizeRoles('CONSERJERIA', 'ADMIN'),
  conserjeriaController.listarCouriers
);

module.exports = router;
