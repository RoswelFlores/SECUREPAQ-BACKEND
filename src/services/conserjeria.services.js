const encomiendaRepository = require('../repositories/encomienda.repository');

const obtenerDashboard = async () => {
  try {
    console.log('[CONSERJERIA] Cargando dashboard');

    const pendientesHoy = await encomiendaRepository.countPendientesHoy();
    const retiradasHoy = await encomiendaRepository.countRetiradasHoy();

    return {
      pendientes_hoy: pendientesHoy,
      retiradas_hoy: retiradasHoy
    };

  } catch (error) {
    console.error('[CONSERJERIA] Error dashboard:', error.message);
    throw error;
  }
};

const obtenerListado = async () => {
  try {
    console.log('[CONSERJERIA] Listando encomiendas');

    const data = await encomiendaRepository.findListadoConserjeria();

    return data.map(e => ({
      otp: e.otp || '—',
      tracking: e.tracking,
      courier: e.courier,
      residente: e.residente,
      departamento: e.departamento,
      fecha_recepcion: e.fecha_recepcion,
      fecha_retiro: e.fecha_retiro || '—',
      estado: e.estado === 'RECIBIDA' ? 'PENDIENTE' : 'RETIRADO'
    }));

  } catch (error) {
    console.error('[CONSERJERIA] Error listado:', error.message);
    throw error;
  }
};

module.exports = { obtenerDashboard, obtenerListado };
