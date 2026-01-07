const pool = require('../config/db');

const findByEmailWithRoles = async (email) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      u.id_usuario,
      u.email,
      u.password,
      r.nombre_rol
    FROM usuario u
    INNER JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
    INNER JOIN rol r ON ur.id_rol = r.id_rol
    WHERE u.email = ? AND u.activo = true
    `,
    [email]
  );

  if (rows.length === 0) return null;

  return {
    id_usuario: rows[0].id_usuario,
    email: rows[0].email,
    password: rows[0].password,
    roles: rows.map(r => r.nombre_rol)
  };
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, email, password FROM usuario WHERE email = ? AND activo = true',
    [email]
  );

  return rows[0] || null;
};

module.exports = {
  findByEmailWithRoles,
  findByEmail
};
