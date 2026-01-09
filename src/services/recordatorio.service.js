const encomiendaRepository = require('../repositories/encomienda.repository');
const notificacionService = require('./notificacion.service');

const ejecutarRecordatorios = async () => {
  try {
    console.log('[JOB] Ejecutando recordatorio +3 días');

    const encomiendas = await encomiendaRepository.findPendientesMas3Dias();

    if (encomiendas.length === 0) {
      console.log('[JOB] No hay encomiendas pendientes');
      return;
    }

    for (const enc of encomiendas) {
      await notificacionService.registrarNotificacion(
        'Recordatorio: tiene una encomienda pendiente de retiro',
        enc.id_residente,
        enc.id_encomienda,
        'RECORDATORIO_3_DIAS'
      );

      console.log('[JOB] Recordatorio generado encomienda ID:', enc.id_encomienda);
    }

  } catch (error) {
    console.error('[JOB] Error recordatorios:', error.message);
  }
};

module.exports = {
  ejecutarRecordatorios
};
