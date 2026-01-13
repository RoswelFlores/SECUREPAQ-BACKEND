const pool = require('../config/db');

const listAll = async () => {
  const [rows] = await pool.execute(
    `
    SELECT id_courier, nombre
    FROM courier
    ORDER BY nombre ASC
    `
  );

  return rows;
};

module.exports = {
  listAll
};
