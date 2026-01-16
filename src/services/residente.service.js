const encomiendaRepository = require('../repositories/encomienda.repository');
const crypto = require('crypto');
const otpRepository = require('../repositories/otp.repository');
const auditoriaService = require('./auditoria.service');
const mailService = require('./mail.service');
const residenteRepository = require('../repositories/residente.repository');
const notificacionRepository = require('../repositories/notificacion.repository');
const usuarioRepository = require('../repositories/usuario.repository');

const resolveResidenteId = async (idUsuario) => {
  const usuario = await usuarioRepository.findById(idUsuario);
  if (!usuario || !usuario.email) {
    throw new Error('Usuario no encontrado');
  }

  const residente = await residenteRepository.findByEmail(usuario.email);
  if (!residente) {
    throw new Error('Residente no encontrado');
  }

  return residente.id_residente;
};

const obtenerPendientes = async (idUsuario) => {
  try {
    console.log('[RESIDENTE] Cargando pendientes');

    const idResidente = await resolveResidenteId(idUsuario);
    return await encomiendaRepository.findPendientesByResidente(idResidente);

  } catch (error) {
    console.error('[RESIDENTE] Error pendientes:', error.message);
    throw error;
  }
};

const obtenerHistorial = async (idUsuario) => {
  try {
    console.log('[RESIDENTE] Cargando historial');

    const idResidente = await resolveResidenteId(idUsuario);
    return await encomiendaRepository.findHistorialByResidente(idResidente);

  } catch (error) {
    console.error('[RESIDENTE] Error historial:', error.message);
    throw error;
  }
};

const regenerarOtp = async (idUsuario, idEncomienda) => {
  try {
    console.log('[RESIDENTE] Regenerando OTP');

    const idResidente = await resolveResidenteId(idUsuario);
    const encomienda = await encomiendaRepository.findById(idEncomienda);
    if (!encomienda || encomienda.id_residente !== idResidente) {
      throw new Error('No autorizado');
    }


    const codigo = crypto.randomInt(100000, 999999).toString();
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

    await otpRepository.updateOtpByEconmienda(
      idEncomienda,
      codigo,
      fechaExpiracion
    );  

    await auditoriaService.registrar(
      'REGENERAR_OTP',
      `residente:${idResidente}`,
      idEncomienda
    );

    await mailService.sendRegenerarOtpMail(
      idResidente,
      codigo,
      idEncomienda
    );

    return { message: 'OTP regenerado correctamente' };

  } catch (error) {
    console.error('[RESIDENTE] Error regenerar OTP:', error.message);
    throw error;
  }
};

const listarNotificaciones = async (idUsuario) => {
  try {
    console.log('[RESIDENTE] Listando notificaciones usuario:', idUsuario);

    const rows = await residenteRepository.listarNotificaciones(idUsuario);
    console.log('[RESIDENTE] Notificaciones encontradas:', rows.length);
    return rows.map(n => ({
      id_notificacion: n.id_notificacion,
      tipo: n.codigo_tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      tracking: n.tracking,
      fecha_hora: n.fecha_envio,
      leida: n.leida,
      id_encomienda: n.id_encomienda
    }));

  } catch (error) {
    console.error('[RESIDENTE] Error notificaciones:', error.message);
    throw error;
  }
};

const marcarNotificacionComoLeida = async (idNotificacion) => {
  try {
    console.log('[RESIDENTE] Marcando notificación como leída:', idNotificacion);

    await notificacionRepository.marcarComoLeida(idNotificacion);
  } catch (error) {
    console.error('[RESIDENTE] Error marcar notificación como leída:', error.message);
    throw error;
  }
};

module.exports = {
  obtenerPendientes,
  obtenerHistorial,
  regenerarOtp,
  listarNotificaciones,
  marcarNotificacionComoLeida
};
