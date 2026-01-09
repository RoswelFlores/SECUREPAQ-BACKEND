const encomiendaService = require('../services/encomienda.service');

const registrar = async (req, res) => {
  try {
    const result = await encomiendaService.registrarEncomienda(
      req.body,
      req.user
    );

    return res.status(201).json(result);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const confirmarRetiro = async (req, res) => {
  try {
    const {id_encomienda, observacion } = req.body;

    if (!id_encomienda) {
      return res.status(400).json({ error: 'ID encomienda requerido' });
    }

    const result = await encomiendaService.confirmarRetiro(
      id_encomienda,
      observacion,
      req.user
    );

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { registrar, confirmarRetiro };
