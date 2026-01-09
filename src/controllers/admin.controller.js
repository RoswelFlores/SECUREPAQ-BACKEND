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

module.exports = { countAllUsers };