const pool = require('../config/db');

const insertar = async ({ mensaje, canal, idUsuario, idEncomienda, idTipoNotificacion }) => {
  await pool.execute(
    `
    INSERT INTO notificacion
    (mensaje, canal, id_usuario, id_encomienda, id_tipo_notificacion)
    VALUES (?, ?, ?, ?, ?)
    `,
    [mensaje, canal, idUsuario, idEncomienda, idTipoNotificacion]
  );
};

const existeRecordatorio = async (idEncomienda, idTipoNotificacion) => {
  const [rows] = await pool.execute(
    `
    SELECT 1
    FROM notificacion
    WHERE id_encomienda = ?
      AND id_tipo_notificacion = ?
    LIMIT 1
    `,
    [idEncomienda, idTipoNotificacion]
  );

  return rows.length > 0;
};

module.exports = {
  insertar,
  existeRecordatorio
};
