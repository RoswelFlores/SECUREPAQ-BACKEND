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

const buscarResidentes = async (req, res) => {
  try {
    const query = req.query.query || '';
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await conserjeriaService.buscarResidentes(query, limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const listarResidentesConDepartamento = async (req, res) => {
  try {
    const data = await conserjeriaService.listarResidentesConDepartamento();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const listarCouriers = async (req, res) => {
  try {
    const data = await conserjeriaService.listarCouriers();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  obtenerDashboard,
  obtenerListado,
  buscarResidentes,
  listarResidentesConDepartamento,
  listarCouriers
};
