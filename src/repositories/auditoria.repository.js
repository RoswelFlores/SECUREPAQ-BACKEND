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

const findAll = async () => {
  const [rows] = await pool.execute(
    `
        SELECT
      a.fecha_evento,

      -- Nombre visible del usuario
      COALESCE(r_admin.nombre, u.email, a.usuario_sistema) AS usuario_nombre,

      -- Rol principal (uno solo)
      COALESCE(ro.nombre_rol, 'SIN_ROL') AS rol,

      a.accion,

      -- Detalle contextual
      CASE a.accion
        WHEN 'REGISTRO_ENCOMIENDA' THEN
          CONCAT(
            'Registro encomienda ',
            COALESCE(c.nombre, 'Courier'),
            ' - ',
            COALESCE(r_pkg.nombre, 'Residente'),
            ' (',
            COALESCE(d.numero, 'Sin depto'),
            ')'
          )
        WHEN 'RETIRO_ENCOMIENDA' THEN
          COALESCE(
            NULLIF(e.observacion, ''),
            CONCAT(
              'Retiro encomienda #',
              COALESCE(e.tracking, 'N/A'),
              ' - ',
              COALESCE(r_pkg.nombre, 'Residente'),
              ' (',
              COALESCE(d.numero, 'Sin depto'),
              ')'
            )
          )
        WHEN 'REGENERAR_OTP' THEN
          CONCAT(
            'Regeneración OTP encomienda #',
            COALESCE(e.tracking, 'N/A')
          )
        ELSE
          'Acción del sistema'
      END AS detalle

    FROM auditoria_encomienda a

    -- Usuario que ejecutó la acción
    LEFT JOIN usuario u 
      ON u.email = a.usuario_sistema

    -- UN SOLO rol (el primero / principal)
    LEFT JOIN (
      SELECT ur.id_usuario, MIN(ur.id_rol) AS id_rol
      FROM usuario_rol ur
      GROUP BY ur.id_usuario
    ) ur
      ON ur.id_usuario = u.id_usuario
    LEFT JOIN rol ro 
      ON ro.id_rol = ur.id_rol

    -- Datos del paquete
    LEFT JOIN encomienda e 
      ON e.id_encomienda = a.id_encomienda
    LEFT JOIN courier c 
      ON c.id_courier = e.id_courier
    LEFT JOIN residente r_pkg 
      ON r_pkg.id_residente = e.id_residente
    LEFT JOIN departamento d 
      ON d.id_departamento = r_pkg.id_departamento

    -- Si el usuario ES residente, sacamos nombre
    LEFT JOIN residente r_admin 
      ON r_admin.email = u.email

    ORDER BY a.fecha_evento DESC

    `
  );

  return rows;
};

module.exports = {
  insertar,
  findAll
};
