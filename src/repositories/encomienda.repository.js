const pool = require('../config/db');

const insertar = async (data) => {
  const [result] = await pool.execute(
    `
    INSERT INTO encomienda
    (tracking, descripcion, tipo_paquete, tamanio, fecha_recepcion, estado, id_residente, id_courier)
    VALUES (?, ?, ?, ?, ?, 'RECIBIDA', ?, ?)
    `,
    [
      data.tracking,
      data.descripcion || '',
      data.tipo_paquete,
      data.tamanio,
      data.fechaHoraRecepcion,
      data.id_residente,
      data.id_courier
    ]
  );

  return result.insertId;
};

const actualizarEstado = async (idEncomienda, estado) => {
  await pool.execute(
    'UPDATE encomienda SET estado = ? WHERE id_encomienda = ?',
    [estado, idEncomienda]
  );
};

const actualizarRetiro = async (idEncomienda, observacion) => {
  await pool.execute(
    `
    UPDATE encomienda
    SET estado = 'RETIRADA',
        observacion = ?
    WHERE id_encomienda = ?
    `,
    [observacion || null, idEncomienda]
  );
};

const findDetalleById = async (idEncomienda) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      e.id_encomienda,
      e.descripcion,
      c.nombre AS courier,
      r.nombre AS residente,
      d.numero AS departamento
    FROM encomienda e
    JOIN courier c ON e.id_courier = c.id_courier
    JOIN residente r ON e.id_residente = r.id_residente
    JOIN departamento d ON r.id_departamento = d.id_departamento
    WHERE e.id_encomienda = ?
    `,
    [idEncomienda]
  );

  return rows[0];
};

const findResidenteByEncomienda = async (idEncomienda) => {
  const [rows] = await pool.execute(
    'SELECT id_residente FROM encomienda WHERE id_encomienda = ?',
    [idEncomienda]
  );

  return rows[0]?.id_residente;
};

module.exports = {
  insertar,
  actualizarEstado,
  findDetalleById,
  findResidenteByEncomienda
};
