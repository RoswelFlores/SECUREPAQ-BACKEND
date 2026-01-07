const transporter = require('../config/mail');

const sendRecoverPasswordMail = async (to, password) => {
  try {
    await transporter.sendMail({
      from: `"SECUREPAQ" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Recuperación de contraseña – SECUREPAQ',
      html: `
        <p>Estimado/a usuario,</p>
        <p>Su contraseña registrada es:</p>
        <p><strong>${password}</strong></p>
        <p>Atentamente,<br/>Sistema SECUREPAQ</p>
      `
    });
  } catch (error) {
    console.error('[MAIL] Error enviando correo:', error.message);
    throw new Error('No fue posible enviar el correo');
  }
};

module.exports = { sendRecoverPasswordMail };
