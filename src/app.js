require('./config/db');
require('./config/mail');
require('./jobs/recordatorio.job');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const encomiendaRoutes = require('./routes/encomienda.routes');
const otpRoutes = require('./routes/otp.routes');
const notificacionRoutes = require('./routes/notificacion.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/encomiendas', encomiendaRoutes);
app.use('/otp', otpRoutes);
app.use('/notificaciones', notificacionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SECUREPAQ backend activo' });
});

module.exports = app;
