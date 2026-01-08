const pool = require('../config/db');

const findById = async (idResidente) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      r.id_residente,
      r.nombre,
      r.email,
      d.numero AS departamento,
      d.piso
    FROM residente r
    INNER JOIN departamento d ON r.id_departamento = d.id_departamento
    WHERE r.id_residente = ? AND r.activo = true
    `,
    [idResidente]
  );

  return rows[0] || null;
};

module.exports = {
  findById
};
