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

module.exports = { insertar };
