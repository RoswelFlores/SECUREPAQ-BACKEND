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

    const otp = await otpRepository.findByCodigoValido(codigo);

    if (!otp) {
      throw new Error('OTP inválido o expirado');
    }

    const detalle = await encomiendaRepository.findDetalleById(otp.id_encomienda);

    return detalle;

  } catch (error) {
    console.error('[RETIRO] Error validando OTP:', error.message);
    throw error;
  }
};

const confirmarRetiro = async (idEncomienda, observacion, usuario) => {
  try {
    console.log('[RETIRO] Confirmando retiro encomienda ID:', idEncomienda);

    const otp = await otpRepository.findByCodigoValidoPorEncomienda(idEncomienda);

    if (!otp) {
      throw new Error('No existe OTP válido para esta encomienda');
    }

    
    await otpRepository.marcarComoUsado(otp.id_otp);


    await encomiendaRepository.actualizarEstado(idEncomienda, 'RETIRADA');

  
    await auditoriaService.registrar(
      'RETIRO_ENCOMIENDA',
      usuario.email,
      idEncomienda
    );

    
    const idResidente = await encomiendaRepository.findResidenteByEncomienda(idEncomienda);
    await mailService.sendRetiroConfirmadoMail(idResidente);

    console.log('[RETIRO] Retiro confirmado encomienda ID:', idEncomienda);

    return {
      message: 'Encomienda retirada correctamente'
    };

  } catch (error) {
    console.error('[RETIRO] Error retiro:', error.message);
    throw error;
  }
};


module.exports = {
  generarYGuardarOTP,
  validarOTP,
  confirmarRetiro
};
