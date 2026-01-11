const adminService = require('../services/admin.service');


const countAllUsers = async (req,res) => {
  try {
    console.log('[Admin Controller] total de usuarios');

    const totalUsers = await adminService.countAllUsers();

    console.log('[Admin Controller] Usuarios contados con éxito');

   return res.json({ totalUsuarios: totalUsers.total });
  } catch (error) {
    console.error('[Admin Controller] Error al contar usuarios:', error.message);
    throw error;
  }
};

const getUsuarios = async (req, res) => {
  try {
    const data = await adminService.listarUsuarios();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const result = await adminService.crearUsuario(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { activo } = req.body;  
    await adminService.cambiarEstado(idUsuario, activo);
    res.json({ message: 'Estado del usuario actualizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } 
};

const resetPassword = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    await adminService.resetPassword(idUsuario);
    res.json({ message: 'Contraseña reseteada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { countAllUsers, getUsuarios, crearUsuario,cambiarEstado, resetPassword };