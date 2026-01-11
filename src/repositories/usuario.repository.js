const pool = require('../config/db');
const bcrypt = require('bcrypt');

const getExecutor = (connection) => connection || pool;

const findByEmailWithRoles = async (email, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
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

const findByEmail = async (email, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    'SELECT id_usuario, email, password FROM usuario WHERE email = ? AND activo = true',
    [email]
  );

  return rows[0] || null;
};

const countAllUsers = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    'SELECT COUNT(*) as total FROM usuario WHERE activo = true'
  );

  return rows[0] || null;
};


const findAll = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
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


const crearUsuario = async ({ email, rol }, connection) => {
  const executor = getExecutor(connection);
  const passwordTemporal = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(passwordTemporal, 10);

  const [result] = await executor.execute(
    `
    INSERT INTO usuario (email, password, activo)
    VALUES (?, ?, true)
    `,
    [email, hash]
  );

  return { idUsuario: result.insertId, passwordTemporal };
};
const findRoleByName = async (nombre_rol, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    'SELECT id_rol FROM rol WHERE nombre_rol = ?',
    [nombre_rol]
  );
  return rows[0] || null;
};

const asignarRol = async (idUsuario, rol, connection) => {
  const executor = getExecutor(connection);
  const role_row = await findRoleByName(rol, connection);
  await executor.execute(
    'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
    [idUsuario, role_row.id_rol]
  );
};

const actualizarUsuario = async (idUsuario, activo, connection) => {
  const executor = getExecutor(connection);
  row =  await executor.execute(
    'UPDATE usuario SET activo = ? WHERE id_usuario = ?',
    [activo, idUsuario]
  );
  if (row.affectedRows == 0 && row.changedRows == 0) {
    throw new Error('Usuario no encontrado');
  }
  return row;
};

const findById = async (idUsuario, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    'SELECT id_usuario, email FROM usuario WHERE id_usuario = ?',
    [idUsuario]
  );
  return rows[0] || null;
};

const actualizarPassword = async (idUsuario, nuevaPasswordHash, connection) => {
  const executor = getExecutor(connection);
  await executor.execute(
    'UPDATE usuario SET password = ? WHERE id_usuario = ?',
    [nuevaPasswordHash, idUsuario]
  );
};

const editarUsuario = async (idUsuario, datosActualizados, connection) => {
  const executor = getExecutor(connection);
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(datosActualizados)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(idUsuario);

  const sql = `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`;
  const [result] = await executor.execute(sql, values);
  if (result.affectedRows === 0) {
    throw new Error('Usuario no encontrado');
  }
  return result;;
}

const actualizarUsuarioDatos = async (idUsuario, datosActualizados, connection) => {
  const executor = getExecutor(connection);
  const camposPermitidos = ['email', 'activo'];
  const fields = [];
  const values = [];

  for (const campo of camposPermitidos) {
    if (datosActualizados[campo] !== undefined) {
      fields.push(`${campo} = ?`);
      values.push(datosActualizados[campo]);
    }
  }

  if (fields.length === 0) {
    return { skipped: true };
  }

  values.push(idUsuario);
  const [result] = await executor.execute(
    `UPDATE usuario SET ${fields.join(', ')} WHERE id_usuario = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error('Usuario no encontrado');
  }

  return result;
};

const actualizarRolUsuario = async (idUsuario, rol, connection) => {
  const executor = getExecutor(connection);
  const role_row = await findRoleByName(rol, connection);
  if (!role_row) {
    throw new Error('Rol no encontrado');
  }

  const [result] = await executor.execute(
    'UPDATE usuario_rol SET id_rol = ? WHERE id_usuario = ?',
    [role_row.id_rol, idUsuario]
  );

  if (result.affectedRows === 0) {
    await executor.execute(
      'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
      [idUsuario, role_row.id_rol]
    );
  }
};

module.exports = {
  findByEmailWithRoles,
  findByEmail,
  countAllUsers,
  findAll,asignarRol,
  crearUsuario,actualizarUsuario,
  findById,actualizarPassword,editarUsuario,
  actualizarUsuarioDatos,actualizarRolUsuario
};
