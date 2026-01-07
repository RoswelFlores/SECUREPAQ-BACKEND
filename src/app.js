require('./config/db')
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SECUREPAQ backend activo' });
});

module.exports = app; // 👈 ESTO ES CLAVE
