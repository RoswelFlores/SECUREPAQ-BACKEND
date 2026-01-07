const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolesUsuario = req.user.roles;

    const autorizado = rolesPermitidos.some(rol =>
      rolesUsuario.includes(rol)
    );

    if (!autorizado) {
      return res.status(403).json({
        error: 'No tiene permisos para esta acción'
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
