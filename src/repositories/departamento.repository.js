
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



module.exports = {
  insert,
  update
};
