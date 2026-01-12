const residenteService = require('../services/residente.service');


const getPendientes = async (req, res) => {
  try {
    
    const idResidente = req.user.id;

    const data = await residenteService.obtenerPendientes(idResidente);
    return res.json(data);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


const getHistorial = async (req, res) => {
  try {
    const idResidente = req.user.id;

    const data = await residenteService.obtenerHistorial(idResidente);
    return res.json(data);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


const regenerarOtp = async (req, res) => {
  try {
    const idResidente = req.user.id;
    const { id_encomienda } = req.body;

    if (!id_encomienda) {
      return res.status(400).json({ error: 'id_encomienda es obligatorio' });
    }

    const result = await residenteService.regenerarOtp(idResidente, id_encomienda);
    return res.json(result);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


const getNotificaciones = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    const data = await residenteService.listarNotificaciones(idUsuario);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPendientes,
  getHistorial,
  regenerarOtp,
  getNotificaciones
};
