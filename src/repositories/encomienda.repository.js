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

const findPendientesMas3Dias = async () => {
  const [rows] = await pool.execute(
    `
    SELECT 
      e.id_encomienda,
      e.id_residente,
      r.email,
      r.nombre
    FROM encomienda e
    JOIN residente r ON e.id_residente = r.id_residente
    WHERE e.estado = 'RECIBIDA'
      AND e.fecha_recepcion <= DATE_SUB(NOW(), INTERVAL 3 DAY)
    `
  );

  return rows;
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

const countPendientesHoy = async () => {
  const [rows] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM encomienda
    WHERE estado = 'RECIBIDA'
      AND DATE(fecha_recepcion) = CURDATE()
    `
  );
  return rows[0].total;
};

const countRetiradasHoy = async () => {
  const [rows] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM auditoria_encomienda
    WHERE accion = 'RETIRO_ENCOMIENDA'
      AND DATE(fecha_evento) = CURDATE()
    `
  );
  return rows[0].total;
};

const findListadoConserjeria = async () => {
  const [rows] = await pool.execute(
    `
    SELECT 
      o.codigo AS otp,
      e.tracking,
      c.nombre AS courier,
      r.nombre AS residente,
      d.numero AS departamento,
      e.fecha_recepcion,
      a.fecha_evento AS fecha_retiro,
      e.estado
    FROM encomienda e
    JOIN courier c ON e.id_courier = c.id_courier
    JOIN residente r ON e.id_residente = r.id_residente
    JOIN departamento d ON r.id_departamento = d.id_departamento
    LEFT JOIN otp_encomienda o 
      ON o.id_encomienda = e.id_encomienda AND o.usado = false
    LEFT JOIN auditoria_encomienda a 
      ON a.id_encomienda = e.id_encomienda 
     AND a.accion = 'RETIRO_ENCOMIENDA'
    ORDER BY e.fecha_recepcion DESC
    `
  );

  return rows;
};

module.exports = {
  insertar,
  actualizarEstado,
  findDetalleById,
  findResidenteByEncomienda,
  findPendientesMas3Dias,
  countPendientesHoy,
  countRetiradasHoy,
  findListadoConserjeria
};
