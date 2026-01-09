const encomiendaRepository = require('../repositories/encomienda.repository');
const mailService = require('./mail.service');

const ejecutarRecordatorios = async () => {
  try {
    console.log('[JOB] Ejecutando recordatorio +3 días');

    const encomiendas = await encomiendaRepository.findPendientesMas3Dias();

    if (encomiendas.length === 0) {
      console.log('[JOB] No hay encomiendas pendientes');
      return;
    }

    for (const enc of encomiendas) {
      await mailService.sendRecordatorioMail(enc);
      console.log('[JOB] Recordatorio enviado encomienda ID:', enc.id_encomienda);
    }

  } catch (error) {
    console.error('[JOB] Error recordatorios:', error.message);
  }
};

module.exports = {
  ejecutarRecordatorios
};
