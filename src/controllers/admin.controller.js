const adminService = require('../services/admin.service');


const countAllUsers = async (req,res) => {
  try {
    console.log('[Admin Controller] total de usuarios');

    const totalUsers = await adminService.countAllUsers();

    console.log('[Admin Controller] Usuarios contados con éxito');

   return res.json({ totalUsuarios: totalUsers.total });
  } catch (error) {
    console.error('[Admin Controller] Error al contar usuarios:', error.message);
    return res.status(500).json({
      message: 'No se pudo obtener el total de usuarios.',
      error: error.message
    });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const data = await adminService.listarUsuarios();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo listar usuarios.',
      error: error.message
    });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const result = await adminService.crearUsuario(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo crear el usuario.',
      error: error.message
    });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const { activo } = req.body;  
    await adminService.cambiarEstado(idUsuario, activo);
    res.json({ message: 'Estado del usuario actualizado correctamente' });
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo actualizar el estado del usuario.',
      error: error.message
    });
  } 
};

const resetPassword = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    await adminService.resetPassword(idUsuario);
    res.json({ message: 'Contraseña reseteada correctamente' });
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo resetear la contrasena.',
      error: error.message
    });
  }
};
const editarUsuario = async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const datosActualizados = req.body;
    await adminService.editarUsuario(idUsuario, datosActualizados);
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(400).json({
      message: 'No se pudo actualizar el usuario.',
      error: error.message
    });
  }
};

const guardarEstructura = async (req, res) => {
  try {
    const { edificio, departamentos } = req.body;

    if (!edificio || !Array.isArray(departamentos)) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const result = await adminService.guardarEstructura(edificio, departamentos);
    return res.json(result);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


module.exports = { countAllUsers, getUsuarios,
                  crearUsuario,cambiarEstado, resetPassword, 
                  editarUsuario, guardarEstructura };