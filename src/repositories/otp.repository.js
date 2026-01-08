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

const findByCodigoValido = async (codigo) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_encomienda
    WHERE codigo = ?
      AND usado = false
      AND fecha_expiracion > NOW()
    `,
    [codigo]
  );

  return rows[0] || null;
};

const marcarComoUsado = async (idOtp) => {
  await pool.execute(
    'UPDATE otp_encomienda SET usado = true WHERE id_otp = ?',
    [idOtp]
  );
};


const findByCodigoValidoPorEncomienda = async (idEncomienda) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_encomienda
    WHERE id_encomienda = ?
      AND usado = false
      AND fecha_expiracion > NOW()
    `,
    [idEncomienda]
  );

  return rows[0] || null;
};


module.exports = {
  insertar, findByCodigoValido,
  marcarComoUsado,findByCodigoValidoPorEncomienda
};
