const pool = require('../config/db');

const insertar = async ({ accion, usuario, idEncomienda }) => {
  await pool.execute(
    `
    INSERT INTO auditoria_encomienda
    (accion, usuario_sistema, id_encomienda)
    VALUES (?, ?, ?)
    `,
    [accion, usuario, idEncomienda]
  );
};

module.exports = {
  insertar
};
