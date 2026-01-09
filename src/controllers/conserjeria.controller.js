const conserjeriaService = require('../services/conserjeria.services');


const obtenerDashboard = async (req, res) => {
  try {
    const data = await conserjeriaService.obtenerDashboard();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const obtenerListado = async (req, res) => {
  try {
    const data = await conserjeriaService.obtenerListado();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  obtenerDashboard,
  obtenerListado  
};
