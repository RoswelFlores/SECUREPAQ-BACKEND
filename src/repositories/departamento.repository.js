
const insert = async (conn, d) => {
  await conn.execute(
    `
    INSERT INTO departamento (numero, piso, id_edificio)
    VALUES (?, ?, ?)
    `,
    [d.numero, d.piso, d.id_edificio]
  );
};

const update = async (conn, d) => {
  const [result] = await conn.execute(
    `
    UPDATE departamento
    SET numero = ?, piso = ?, id_edificio = ?
    WHERE id_departamento = ?
    `,
    [d.numero, d.piso, d.id_edificio, d.id_departamento]
  );
  return result;
};

const listByEdificio = async (conn, idEdificio) => {
  const [rows] = await conn.execute(
    `
    SELECT id_departamento, numero, piso
    FROM departamento
    WHERE id_edificio = ?
    ORDER BY piso ASC, numero ASC
    `,
    [idEdificio]
  );

  return rows;
};

const deleteByEdificio = async (conn, idEdificio) => {
  await conn.execute(
    'DELETE FROM departamento WHERE id_edificio = ?',
    [idEdificio]
  );
};

const deleteIfNoResidente = async (conn, idDepartamento) => {
  const [result] = await conn.execute(
    `
    DELETE FROM departamento
    WHERE id_departamento = ?
      AND NOT EXISTS (
        SELECT 1 FROM residente WHERE id_departamento = ?
      )
    `,
    [idDepartamento, idDepartamento]
  );

  return result;
};


module.exports = {
  insert,
  update,
  listByEdificio,
  deleteByEdificio,
  deleteIfNoResidente
};
