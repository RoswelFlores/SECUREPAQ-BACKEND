const encomiendaRepository = require('../repositories/encomienda.repository');
const crypto = require('crypto');
const otpRepository = require('../repositories/otp.repository');
const auditoriaService = require('./auditoria.service');
const mailService = require('./mail.service');

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

module.exports = {
  obtenerPendientes,
  obtenerHistorial,
  regenerarOtp
};