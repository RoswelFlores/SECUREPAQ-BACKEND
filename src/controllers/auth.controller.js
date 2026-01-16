const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const result = await authService.login(email, password);
    return res.json(result);

  } catch (error) {
    return res.status(401).json({
      error: error.message
    });
  }
};

const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'El email es obligatorio'
      });
    }

    const result = await authService.recoverPassword(email);
    return res.json(result);

  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
};

module.exports = {
  login,
  recoverPassword
};
