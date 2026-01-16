const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Verificación de conexión
transporter.verify()
  .then(() => console.log('Servidor de correo listo'))
  .catch(err => console.error('Error correo:', err.message));

module.exports = transporter;
