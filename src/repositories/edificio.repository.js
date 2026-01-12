
const upsert = async (conn, e) => {
  const [rows] = await conn.execute('SELECT id_edificio FROM edificio LIMIT 1');

  if (rows.length === 0) {
    const [res] = await conn.execute(
      `
      INSERT INTO edificio (nombre, direccion, comuna, ciudad)
      VALUES (?, ?, ?, ?)
      `,
      [e.nombre, e.direccion, e.comuna, e.ciudad]
    );
    return res.insertId;
  } else {
    await conn.execute(
      `
      UPDATE edificio
      SET nombre = ?, direccion = ?, comuna = ?, ciudad = ?
      WHERE id_edificio = ?
      `,
      [e.nombre, e.direccion, e.comuna, e.ciudad, rows[0].id_edificio]
    );
    return rows[0].id_edificio;
  }
};

module.exports = { upsert };
