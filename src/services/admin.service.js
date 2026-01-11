const usuarioRepository = require('../repositories/usuario.repository');
const residenteRepository = require('../repositories/residente.repository');
const mailService = require('./mail.service');  


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


const crearUsuario = async (data) => {
  try {
    console.log('[ADMIN] Creando usuario:', data.email);

    const { idUsuario, passwordTemporal } =
      await usuarioRepository.crearUsuario(data);

    await usuarioRepository.asignarRol(idUsuario, data.rol);
    let id_departamento = data.id_departamento || null;
   
    
      await residenteRepository.crear({
        nombre: data.nombre,
        rut: data.rut,
        telefono: data.telefono,
        email: data.email,
        is_active : !id_departamento,
        id_departamento: id_departamento
      });

   
    await mailService.sendRecoverPasswordMail(
      data.email,
      passwordTemporal,
      idUsuario
    );

    return { message: 'Usuario creado correctamente' };

  } catch (error) {
    console.error('[ADMIN] Error crear usuario:', error.message);
    throw error;
  }
};


const cambiarEstado = async (idUsuario, activo) => {
  try {
    console.log('[ADMIN] Cambiando estado usuario:', idUsuario);
    await usuarioRepository.actualizarUsuario(idUsuario, activo);
    return { message: 'Estado actualizado' };
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (idUsuario) => {
  try {
    console.log('[ADMIN] Reset password usuario:', idUsuario);

    const nuevaPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(nuevaPassword, 10);

    await usuarioRepository.actualizarPassword(idUsuario, hash);

    const usuario = await usuarioRepository.findById(idUsuario);

    await mailService.sendRecoverPasswordMail(
      usuario.email,
      nuevaPassword,
      idUsuario
    );

    return { message: 'Contraseña reseteada' };

  } catch (error) {
    throw error;
  }
};

module.exports = { countAllUsers, listarUsuarios, crearUsuario, cambiarEstado, resetPassword };