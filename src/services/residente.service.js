const encomiendaRepository = require('../repositories/encomienda.repository');
const crypto = require('crypto');
const otpRepository = require('../repositories/otp.repository');
const auditoriaService = require('./auditoria.service');
const mailService = require('./mail.service');
const residenteRepository = require('../repositories/residente.repository');
const notificacionRepository = require('../repositories/notificacion.repository');

const obtenerPendientes = async (idResidente) => {
  try {
    console.log('[RESIDENTE] Cargando pendientes');

    return await encomiendaRepository.findPendientesByResidente(idResidente);

  } catch (error) {
    console.error('[RESIDENTE] Error pendientes:', error.message);
    throw error;
  }
};

const obtenerHistorial = async (idResidente) => {
  try {
    console.log('[RESIDENTE] Cargando historial');

    return await encomiendaRepository.findHistorialByResidente(idResidente);

  } catch (error) {
    console.error('[RESIDENTE] Error historial:', error.message);
    throw error;
  }
};

const regenerarOtp = async (idResidente, idEncomienda) => {
  try {
    console.log('[RESIDENTE] Regenerando OTP');

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