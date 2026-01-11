const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

const countAllUsers = async () => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM usuario WHERE activo = true'
  );

  return rows[0] || null;
};


const findAll = async () => {
  const [rows] = await pool.execute(
    `
    SELECT
      u.id_usuario,
      r.id_residente,
      r.nombre,
      r.rut,
      r.telefono,
      u.email,
      ro.nombre_rol AS rol,
      d.numero AS departamento,
      u.activo
    FROM usuario u
    JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
    JOIN rol ro ON ur.id_rol = ro.id_rol
    LEFT JOIN residente r ON r.email = u.email
    LEFT JOIN departamento d ON r.id_departamento = d.id_departamento
    ORDER BY r.nombre
    `
  );

  return rows;
};


const crearUsuario = async ({ email, rol }) => {
  const passwordTemporal = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(passwordTemporal, 10);

  const [result] = await pool.execute(
    `
    INSERT INTO usuario (email, password, activo)
    VALUES (?, ?, true)
    `,
    [email, hash]
  );

  return { idUsuario: result.insertId, passwordTemporal };
};

const asignarRol = async (idUsuario, rol) => {
  const [[rolRow]] = await pool.execute(
    'SELECT id_rol FROM rol WHERE nombre_rol = ?',
    [rol]
  );

  await pool.execute(
    'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
    [idUsuario, rolRow.id_rol]
  );
};

const actualizarUsuario = async (idUsuario, activo) => {
  await pool.execute(
    'UPDATE usuario SET activo = ? WHERE id_usuario = ?',
    [activo, idUsuario]
  );
};

const findById = async (idUsuario) => {
  const [rows] = await pool.execute(
    'SELECT id_usuario, email FROM usuario WHERE id_usuario = ?',
    [idUsuario]
  );
  return rows[0] || null;
};

const actualizarPassword = async (idUsuario, nuevaPasswordHash) => {
  await pool.execute(
    'UPDATE usuario SET password = ? WHERE id_usuario = ?',
    [nuevaPasswordHash, idUsuario]
  );
};

module.exports = {
  findByEmailWithRoles,
  findByEmail,
  countAllUsers,
  findAll,asignarRol,
  crearUsuario,actualizarUsuario,
  findById,actualizarPassword
};
