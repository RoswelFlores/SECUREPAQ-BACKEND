const transporter = require('../config/mail');
const residenteRepository = require('../repositories/residente.repository');
const notificacionService = require('./notificacion.service');

const sendRecoverPasswordMail = async (to, password) => {
  try {
    
       await notificacionService.registrarNotificacion(
      'Recuperación de contraseña enviada al usuario',
      idUsuario,
      null,
      'RECOVER_PASSWORD'
      );

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



const sendNuevaEncomiendaMail = async (idResidente, otp , idEncomienda) => {
  try {
    const residente = await residenteRepository.findById(idResidente);

    await notificacionService.registrarNotificacion(
      'Nueva encomienda registrada',
      residente.id_residente,
      idEncomienda,
      'NUEVA_ENCOMIENDA'
    );

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

const sendRetiroConfirmadoMail = async (idResidente,idEncomienda) => {
  try {

    await notificacionService.registrarNotificacion(
      'Encomienda retirada exitosamente',
      idResidente,
      idEncomienda,
      'RETIRO_CONFIRMADO'
    );

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

const sendRecordatorioMail = async (recordatorio) => {
  try {
    if (!recordatorio) {
      throw new Error('Recordatorio no definido');
    }

    const idResidente = recordatorio.id_residente;
    const idEncomienda = recordatorio.id_encomienda;
    const email = recordatorio.email;
    const nombre = recordatorio.nombre || 'residente';

    await notificacionService.registrarNotificacion(
      'Recordatorio: tiene una encomienda pendiente de retiro',
      idResidente,
      idEncomienda,
      'RECORDATORIO_3_DIAS'
    );

    console.log('[MAIL] Simulando envio de recordatorio a:', email, 'encomienda:', idEncomienda);
    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to: email,
    //   subject: 'Recordatorio de encomienda pendiente',
    //   html: `
    //     <p>Estimado/a ${nombre},</p>
    //     <p>Tiene una encomienda pendiente de retiro.</p>
    //     <p>Por favor acuda a conserjeria para realizar el retiro.</p>
    //     <br/>
    //     <p>Atentamente,<br/>Sistema SECUREPAQ</p>
    //   `
    // });
  } catch (error) {
    console.error('[MAIL] Error correo recordatorio:', error.message);
  }
};


const sendRegenerarOtpMail = async (idResidente, otp, idEncomienda) => {
  try {
    const residente = await residenteRepository.findById(idResidente);

    await notificacionService.registrarNotificacion(
      'Se ha generado un nuevo código OTP para su encomienda',
      idResidente,
      idEncomienda,
      'REGENERAR_OTP'
    );

    console.log(
      '[MAIL] Simulando correo regenerar OTP a:',
      residente.email,
      'OTP:',
      otp
    );

    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to: residente.email,
    //   subject: 'Nuevo código OTP para retiro – SECUREPAQ',
    //   html: `
    //     <p>Estimado/a ${residente.nombre},</p>
    //     <p>Se ha generado un nuevo código OTP para el retiro de su encomienda.</p>
    //     <p><strong>Código OTP:</strong> ${otp}</p>
    //     <p>Este código reemplaza al anterior y tiene vigencia limitada.</p>
    //     <br/>
    //     <p>Atentamente,<br/>Sistema SECUREPAQ</p>
    //   `
    // });

  } catch (error) {
    console.error('[MAIL] Error correo regenerar OTP:', error.message);
  
  }
};


module.exports = {
  sendRecoverPasswordMail,
  sendNuevaEncomiendaMail,
  sendRetiroConfirmadoMail,
  sendRecordatorioMail,
  sendRegenerarOtpMail
};
