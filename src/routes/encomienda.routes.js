const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const encomiendaController = require('../controllers/encomienda.controller');

router.post(
  '/',
  verifyToken,
  authorizeRoles('CONSERJERIA'),
  encomiendaController.registrar
);

module.exports = router;
