const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token requerido'
    });
  }

  // Formato esperado: Bearer TOKEN
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, roles }
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = verifyToken;
