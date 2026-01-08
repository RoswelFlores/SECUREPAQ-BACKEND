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

const sendRetiroConfirmadoMail = async (idResidente) => {
  try {
    console.log('[MAIL] Enviando correo confirmación retiro');

    const residente = await residenteRepository.findById(idResidente);
    console.log('Envio de correo de retiro', residente);

    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to: residente.email,
    //   subject: 'Encomienda retirada – SECUREPAQ',
    //   html: `
    //     <p>Estimado/a ${residente.nombre},</p>
    //     <p>Le informamos que su encomienda ha sido retirada exitosamente.</p>
    //     <p>Si usted no reconoce este retiro, por favor comuníquese con conserjería.</p>
    //     <br/>
    //     <p>Atentamente,<br/>Sistema SECUREPAQ</p>
    //   `
    // });

    console.log('[MAIL] Correo retiro enviado a residente ID:', idResidente);

  } catch (error) {
    console.error('[MAIL] Error correo retiro:', error.message);
    
  }
};

module.exports = { sendRecoverPasswordMail, sendNuevaEncomiendaMail,sendRetiroConfirmadoMail };