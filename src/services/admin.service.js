const usuarioRepositor = require('../repositories/usuario.repository');

const countAllUsers = async () => {
  try {
    console.log('[Admin] Cargando usuarios');

    const totalUsers = await usuarioRepositor.countAllUsers();

    console.log('[Admin] Usuarios cargados con éxito');
    return totalUsers;
  } catch (error) {
    console.error('[Admin] Error al cargar usuarios:', error.message);
    throw error;
  } 
};
module.exports = { countAllUsers };