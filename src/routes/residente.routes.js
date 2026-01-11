const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');

const residenteController = require('../controllers/residente.controller');


router.get(
  '/pendientes',
  verifyToken,
  authorizeRoles('RESIDENTE'),
  residenteController.getPendientes
);


router.get(
  '/historial',
  verifyToken,
  authorizeRoles('RESIDENTE'),
  residenteController.getHistorial
);


router.post(
  '/regenerar-otp',
  verifyToken,
  authorizeRoles('RESIDENTE'),
  residenteController.regenerarOtp
);

module.exports = router;
