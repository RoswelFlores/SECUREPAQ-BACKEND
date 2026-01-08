const pool = require('../config/db');

const insertar = async ({ codigo, fechaExpiracion, idEncomienda }) => {
  await pool.execute(
    `
    INSERT INTO otp_encomienda
    (codigo, fecha_expiracion, id_encomienda)
    VALUES (?, ?, ?)
    `,
    [codigo, fechaExpiracion, idEncomienda]
  );
};

module.exports = {
  insertar
};
