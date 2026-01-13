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
router.get(
  '/usuarios',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.getUsuarios
);

router.get(
  '/usuarios/:id/resumen',
  verifyToken,
  authorizeRoles('ADMIN','CONSERJERIA','RESIDENTE'),
  adminController.getUsuarioResumen
);

router.post(
  '/usuarios',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.crearUsuario
);

router.put(
  '/usuarios/:id/perfil',
  verifyToken,
  authorizeRoles('ADMIN','CONSERJERIA','RESIDENTE'),
  adminController.editarUsuarioPerfil
);

router.put(
  '/usuarios/:id',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.cambiarEstado
);

router.post(
  '/usuarios/:id/reset-password',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.resetPassword
);

router.put(
  '/editar-usuarios/:id',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.editarUsuario
);


router.put(
  '/estructura',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.guardarEstructura
);

router.get(
  '/auditoria',
  verifyToken,
  authorizeRoles('ADMIN'),
  adminController.getAuditoria
);


module.exports = router;
