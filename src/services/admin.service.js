const usuarioRepository = require('../repositories/usuario.repository');

const countAllUsers = async () => {
  try {
    console.log('[Admin] Cargando usuarios');

    const totalUsers = await usuarioRepository.countAllUsers();

    console.log('[Admin] Usuarios cargados con éxito');
    return totalUsers;
  } catch (error) {
    console.error('[Admin] Error al cargar usuarios:', error.message);
    throw error;
  } 
};

const listarUsuarios = async () => {
  try {
    console.log('[ADMIN] Listando usuarios');
    return await usuarioRepository.findAll();
  } catch (error) {
    console.error('[ADMIN] Error listar usuarios:', error.message);
    throw error;
  }
};


module.exports = { countAllUsers, listarUsuarios };