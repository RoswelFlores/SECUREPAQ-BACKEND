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

module.exports = {
  insertar
};
