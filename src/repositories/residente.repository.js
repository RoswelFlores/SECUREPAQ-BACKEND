const pool = require('../config/db');

const getExecutor = (connection) => connection || pool;

const findById = async (idResidente, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `
    SELECT 
      r.id_residente,
      r.nombre,
      r.email,
      d.numero AS departamento,
      d.piso
    FROM residente r
    INNER JOIN departamento d ON r.id_departamento = d.id_departamento
    WHERE r.id_residente = ? AND r.activo = true
    `,
    [idResidente]
  );

  return rows[0] || null;
};

const crear = async ({ nombre, rut, email, telefono, is_active, id_departamento }, connection) => {
  const executor = getExecutor(connection);
  const [result] = await executor.execute(
    `
    INSERT INTO residente
    (nombre, rut, email, telefono, activo, id_departamento)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [nombre, rut, email, telefono || null, is_active, id_departamento]
  );

  return result.insertId;
};

const actualizarPorEmail = async (emailActual, datosActualizados, connection) => {
  const executor = getExecutor(connection);
  const camposPermitidos = ['nombre', 'rut', 'telefono', 'email', 'id_departamento', 'activo'];
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

  values.push(emailActual);
  const [result] = await executor.execute(
    `UPDATE residente SET ${fields.join(', ')} WHERE email = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error('Residente no encontrado');
  }

  return result;
};

const listarNotificaciones = async (idUsuario, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `
    SELECT 
      id_notificacion,
      mensaje,
      leida,
      fecha_envio
    FROM notificacion
    WHERE id_usuario = ?
    ORDER BY fecha_envio DESC
    `,
    [idUsuario]
  );

  return rows;
};

const findByEmail = async (email, connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `
    SELECT
      id_residente,
      nombre,
      rut,
      email,
      telefono
    FROM residente
    WHERE email = ?
    `,
    [email]
  );

  return rows[0] || null;
};

const listarConDepartamento = async (connection) => {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(
    `
    SELECT
      r.id_residente,
      r.nombre,
      r.rut,
      r.email,
      d.numero AS departamento
    FROM residente r
    INNER JOIN departamento d ON r.id_departamento = d.id_departamento
    WHERE r.activo = true
      AND r.id_departamento IS NOT NULL
    ORDER BY r.nombre ASC
    `
  );

  return rows;
};

const buscar = async (query, limit = 10, connection) => {
  const executor = getExecutor(connection);
  const term = `%${query}%`;
  const [rows] = await executor.execute(
    `
    SELECT
      r.id_residente,
      r.nombre,
      r.rut,
      r.email,
      d.numero AS departamento
    FROM residente r
    INNER JOIN departamento d ON r.id_departamento = d.id_departamento
    WHERE r.activo = true
      AND (
        r.nombre LIKE ?
        OR r.rut LIKE ?
        OR r.email LIKE ?
        OR d.numero LIKE ?
      )
    ORDER BY r.nombre ASC
    LIMIT ?
    `,
    [term, term, term, term, Number(limit)]
  );

  return rows;
};

module.exports = {
  findById,
  crear,
  actualizarPorEmail,
  listarNotificaciones,
  findByEmail,
  listarConDepartamento,
  buscar
};
