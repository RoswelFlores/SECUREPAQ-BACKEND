const transporter = require('../config/mail');
const residenteRepository = require('../repositories/residente.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const notificacionService = require('./notificacion.service');

const resolveUsuarioIdByEmail = async (email) => {
  if (!email) return null;
  const usuario = await usuarioRepository.findByEmail(email);
  return usuario ? usuario.id_usuario : null;
};

const registrarNotificacionSeguro = async (mensaje, email, idEncomienda, tipo) => {
  const idUsuario = await resolveUsuarioIdByEmail(email);
  if (!idUsuario) {
    console.warn('[MAIL] Usuario no encontrado para notificacion:', email || 'sin-email');
    return;
  }

  await notificacionService.registrarNotificacion(
    mensaje,
    idUsuario,
    idEncomienda,
    tipo
  );
};

const sendRecoverPasswordMail = async (to, password,id_usuario) => {
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

const sendUsuarioNuevoMail = async (to, password) => {
  try {
    console.log('[MAIL] Simulando envío de correo a:', to , 'con contraseña:', password);
    // await transporter.sendMail({
    //   from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
    //   to,
    //   subject: 'Bienvenido a SECUREPAQ',
    //   html: `
    //     <p>Estimado/a usuario,</p>
    //     <p>Se ha creado su cuenta en SECUREPAQ.</p>
    //     <p>Su contraseña temporal es:</p>
    //     <p><strong>${password}</strong></p>
    //     <p>Por favor cambie su contraseña al ingresar al sistema.</p>
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
    if (!residente) {
      console.warn('[MAIL] Residente no encontrado:', idResidente);
      return;
    }

    if (residente) {
      await registrarNotificacionSeguro(
        'Nueva encomienda registrada',
        residente.email,
        idEncomienda,
        'NUEVA_ENCOMIENDA'
      );
    }

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

    const residente = await residenteRepository.findById(idResidente);
    if (!residente) {
      console.warn('[MAIL] Residente no encontrado:', idResidente);
      return;
    }

    await registrarNotificacionSeguro(
      'Encomienda retirada exitosamente',
      residente.email,
      idEncomienda,
      'RETIRO_CONFIRMADO'
    );

    console.log('[MAIL] Enviando correo confirmación retiro');

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

    if (email) {
      await registrarNotificacionSeguro(
        'Recordatorio: tiene una encomienda pendiente de retiro',
        email,
        idEncomienda,
        'RECORDATORIO_3_DIAS'
      );
    } else if (idResidente) {
      const residente = await residenteRepository.findById(idResidente);
      if (residente) {
        await registrarNotificacionSeguro(
          'Recordatorio: tiene una encomienda pendiente de retiro',
          residente.email,
          idEncomienda,
          'RECORDATORIO_3_DIAS'
        );
      }
    }

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
  sendRegenerarOtpMail,
  sendUsuarioNuevoMail
};
