const encomiendaRepository = require('../repositories/encomienda.repository');
const residenteRepository = require('../repositories/residente.repository');
const courierRepository = require('../repositories/courier.repository');

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

const listarResidentesConDepartamento = async () => {
  try {
    console.log('[CONSERJERIA] Listando residentes con departamento');
    return await residenteRepository.listarConDepartamento();
  } catch (error) {
    console.error('[CONSERJERIA] Error listar residentes:', error.message);
    throw error;
  }
};

const buscarResidentes = async (query, limit = 10) => {
  try {
    const trimmed = String(query || '').trim();
    if (trimmed.length === 0) {
      return await listarResidentesConDepartamento();
    }
    if (trimmed.length < 2) {
      return [];
    }

    console.log('[CONSERJERIA] Buscando residentes:', trimmed);
    return await residenteRepository.buscar(trimmed, limit);
  } catch (error) {
    console.error('[CONSERJERIA] Error buscar residentes:', error.message);
    throw error;
  }
};

const listarCouriers = async () => {
  try {
    console.log('[CONSERJERIA] Listando couriers');
    return await courierRepository.listAll();
  } catch (error) {
    console.error('[CONSERJERIA] Error listar couriers:', error.message);
    throw error;
  }
};

module.exports = {
  obtenerDashboard,
  obtenerListado,
  buscarResidentes,
  listarResidentesConDepartamento,
  listarCouriers
};
