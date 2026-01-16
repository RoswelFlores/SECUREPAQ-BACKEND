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

const findByCodigo = async (codigo) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_encomienda
    WHERE codigo = ?
    ORDER BY id_otp DESC
    LIMIT 1
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

const marcarPorEncomiendaComoUsado = async (idEncomienda) => {
  await pool.execute(
    `
    UPDATE otp_encomienda
    SET usado = true
    WHERE id_encomienda = ?
      AND usado = false
    `,
    [idEncomienda]
  );
};

const updateOtpByEconmienda = async (idEncomienda, codigo, fechaExpiracion) => {
  await pool.execute(
    `
    UPDATE otp_encomienda
    SET codigo = ?, fecha_expiracion = ?  
    WHERE id_encomienda = ?
    `,
    [codigo, fechaExpiracion, idEncomienda]
  );
};

module.exports = {
  insertar, findByCodigoValido,
  findByCodigo,
  marcarComoUsado,findByCodigoValidoPorEncomienda,
  marcarPorEncomiendaComoUsado,
  updateOtpByEconmienda
};
