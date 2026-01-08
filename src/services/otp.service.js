const otpRepository = require('../repositories/otp.repository');
const { generarOTP } = require('../utils/otp.util');

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

module.exports = {
  generarYGuardarOTP
};
