const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const otp = require('../controllers/otp.controller');

router.post(
  '/validar-otp',
  verifyToken,
  authorizeRoles('CONSERJERIA'),
  otp.validarOTP
);

router.post(
  '/confirmar-retiro',
  verifyToken,
  authorizeRoles('CONSERJERIA'),
  otp.confirmarRetiro
);

module.exports = router;
