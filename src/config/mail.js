const nodemailer = require('nodemailer');
require('dotenv').config();

const rawPort = process.env.MAIL_PORT || '587';
const port = Number(rawPort) || 587;
const secure =
  typeof process.env.MAIL_SECURE === 'string'
    ? process.env.MAIL_SECURE === 'true'
    : port === 465;

const connectionTimeout = Number(process.env.MAIL_CONN_TIMEOUT_MS) || 10000;
const greetingTimeout = Number(process.env.MAIL_GREETING_TIMEOUT_MS) || 10000;
const socketTimeout = Number(process.env.MAIL_SOCKET_TIMEOUT_MS) || 15000;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port,
  secure,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  connectionTimeout,
  greetingTimeout,
  socketTimeout
});

const userLabel = process.env.MAIL_USER
  ? process.env.MAIL_USER.replace(/(^.).*(@.*$)/, '$1***$2')
  : 'no-user';
console.log(
  `[MAIL] Config: host=${process.env.MAIL_HOST || 'missing'} port=${port} secure=${secure} user=${userLabel}`
);

// Verificación de conexión
transporter.verify()
  .then(() => console.log('Servidor de correo listo'))
  .catch(err => console.error('Error correo:', err.message || err));

module.exports = transporter;
