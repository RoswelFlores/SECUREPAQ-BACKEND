const notificacionRepository = require('../repositories/notificacion.repository');

const registrarNotificacion = async (
  mensaje,
  idUsuario,
  idEncomienda,
  codigoTipoNotificacion
) => {
  try {
    console.log('[NOTIFICACION] Registrando notificación:', codigoTipoNotificacion);

 
    const [rows] = await require('../config/db').execute(
      'SELECT id_tipo_notificacion FROM tipo_notificacion WHERE codigo = ?',
      [codigoTipoNotificacion]
    );

    if (rows.length === 0) {
      throw new Error('Tipo de notificación no configurado');
    }

    await notificacionRepository.insertar({
      mensaje,
      canal: 'EMAIL',
      idUsuario,
      idEncomienda,
      idTipoNotificacion: rows[0].id_tipo_notificacion
    });

    console.log('[NOTIFICACION] Notificación registrada');

  } catch (error) {
    console.error('[NOTIFICACION] Error:', error.message);
    // ⚠️ No romper flujo principal
  }
};

module.exports = {
  registrarNotificacion
};
