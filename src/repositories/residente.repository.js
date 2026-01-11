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

module.exports = {
  findById,
  crear
};
