const transporter = require('../config/mail');
const residenteRepository = require('../repositories/residente.repository');


const sendRecoverPasswordMail = async (to, password) => {
  try {
    console.log('[MAIL] Simulando envío de correo a:', to , 'con contraseña:', password);
    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to,
    //   subject: 'Recuperación de contraseña – SECUREPAQ',
    //   html: `
    //     <p>Estimado/a usuario,</p>
    //     <p>Su contraseña registrada es:</p>
    //     <p><strong>${password}</strong></p>
    //     <p>Atentamente,<br/>Sistema SECUREPAQ</p>
    //   `
    // });
  } catch (error) {
    console.error('[MAIL] Error enviando correo:', error.message);
    throw new Error('No fue posible enviar el correo');
  }
};



const sendNuevaEncomiendaMail = async (idResidente, otp) => {
  try {
    const residente = await residenteRepository.findById(idResidente);
    console.log('[MAIL] Simulando envío de correo a:', residente.email , 'con OTP:', otp);
    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to: residente.email,
    //   subject: 'Nueva encomienda registrada',
    //   html: `
    //     <p>Estimado/a ${residente.nombre},</p>
    //     <p>Se ha registrado una nueva encomienda a su nombre.</p>
    //     <p><strong>Código OTP:</strong> ${otp}</p>
    //     <p>Presente este código al momento del retiro.</p>
    //   `
    // });
  } catch (error) {
    console.error('[MAIL] Error correo nueva encomienda:', error.message);
  }
};

module.exports = { sendRecoverPasswordMail, sendNuevaEncomiendaMail };