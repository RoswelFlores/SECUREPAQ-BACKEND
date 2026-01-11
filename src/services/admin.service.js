const usuarioRepository = require('../repositories/usuario.repository');
const residenteRepository = require('../repositories/residente.repository');
const mailService = require('./mail.service');  
const pool = require('../config/db');
const bcrypt = require('bcrypt');


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
  const connection = await pool.getConnection();
  let transactionActive = false;
  try {
    console.log('[ADMIN] Creando usuario:', data.email);

    await connection.beginTransaction();
    transactionActive = true;

    const { idUsuario, passwordTemporal } =
      await usuarioRepository.crearUsuario(data, connection);

    await usuarioRepository.asignarRol(idUsuario, data.rol, connection);
    let id_departamento = data.id_departamento || null;

    await residenteRepository.crear({
      nombre: data.nombre,
      rut: data.rut,
      telefono: data.telefono,
      email: data.email,
      is_active : !id_departamento,
      id_departamento: id_departamento
    }, connection);

    await connection.commit();
    transactionActive = false;

    try {
      await mailService.sendRecoverPasswordMail(
        data.email,
        passwordTemporal,
        idUsuario
      );
    } catch (mailError) {
      console.error('[ADMIN] Error enviando correo:', mailError.message);
      throw new Error('Usuario creado, pero no se pudo enviar el correo de recuperacion.');
    }

    return { message: 'Usuario creado correctamente' };

  } catch (error) {
    if (transactionActive) {
      await connection.rollback();
    }
    console.error('[ADMIN] Error crear usuario:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};


const cambiarEstado = async (idUsuario, activo) => {
  const connection = await pool.getConnection();
  let transactionActive = false;
  try {
    console.log('[ADMIN] Cambiando estado usuario:', idUsuario);
    let userExists = await usuarioRepository.findById(idUsuario, connection);
    if (!userExists) {
      throw new Error('Usuario no encontrado');
    }
    await usuarioRepository.actualizarUsuario(idUsuario, activo, connection);
    return { message: 'Estado actualizado' };
  } catch (error) {
    if (transactionActive) {
      await connection.rollback();
    }
    throw error;
  } finally {
    connection.release();
  }
};

const resetPassword = async (idUsuario) => {
  const connection = await pool.getConnection();
  try {
    console.log('[ADMIN] Reset password usuario:', idUsuario);

    const nuevaPassword = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(nuevaPassword, 10);

    await connection.beginTransaction();
    await usuarioRepository.actualizarPassword(idUsuario, hash, connection);

    const usuario = await usuarioRepository.findById(idUsuario, connection);
    await connection.commit();

    try {
      await mailService.sendRecoverPasswordMail(
        usuario.email,
        nuevaPassword,
        idUsuario
      );
    } catch (mailError) {
      console.error('[ADMIN] Error enviando correo:', mailError.message);
      throw new Error('Contrasena actualizada, pero no se pudo enviar el correo de recuperacion.');
    }

    return { message: 'Contraseña reseteada' };

  } catch (error) {
    throw error;
  }
};

module.exports = { countAllUsers, listarUsuarios, crearUsuario, cambiarEstado, resetPassword };
