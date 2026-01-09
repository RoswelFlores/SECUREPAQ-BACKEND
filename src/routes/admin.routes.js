const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware')
const adminController = require('../controllers/admin.controller');

router.get(
  '/countAllUsers',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.countAllUsers
);

module.exports = router;