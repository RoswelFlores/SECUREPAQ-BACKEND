const otpService = require('../services/otp.service');

const validarOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: 'OTP es obligatorio' });
    }

    const data = await otpService.validarOTP(otp);
    return res.json(data);

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

    const result = await otpService.confirmarRetiro(
      id_encomienda,
      observacion,
      req.user
    );

    return res.json(result);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  validarOTP,
  confirmarRetiro
};
