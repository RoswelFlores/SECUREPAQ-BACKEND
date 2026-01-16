const otpRepository = require('../repositories/otp.repository');
const { generarOTP } = require('../utils/otp.util');
const encomiendaRepository = require('../repositories/encomienda.repository');
const auditoriaService = require('./auditoria.service');
const mailService = require('../services/mail.service');

const generarYGuardarOTP = async (idEncomienda) => {
  try {
    console.log('[OTP] Generando OTP para encomienda ID:', idEncomienda);

    const codigo = generarOTP();

    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(
      fechaExpiracion.getDate() + Number(process.env.OTP_EXPIRATION_DAYS || 7)
    );

    await otpRepository.insertar({
      codigo,
      fechaExpiracion,
      idEncomienda
    });

    console.log('[OTP] OTP generado y almacenado para encomienda ID:', idEncomienda);

    return codigo;
  } catch (error) {
    console.error('[OTP] Error generando OTP:', error.message);
    throw error;
  }
};


const validarOTP = async (codigo) => {
  try {
    console.log('[RETIRO] Validando OTP');

    const otp = await otpRepository.findByCodigo(codigo);

    if (!otp) {
      throw new Error('OTP incorrecto');
    }

    if (otp.usado) {
      throw new Error('OTP expirado');
    }

    const expiracion = new Date(otp.fecha_expiracion);
    if (Number.isNaN(expiracion.getTime()) || expiracion <= new Date()) {
      throw new Error('OTP expirado');
    }

    const detalle = await encomiendaRepository.findDetalleById(otp.id_encomienda);

    return detalle;

  } catch (error) {
    console.error('[RETIRO] Error validando OTP:', error.message);
    throw error;
  }
};




module.exports = {
  generarYGuardarOTP,
  validarOTP
};

