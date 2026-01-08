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

module.exports = { registrar };
