const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuario.repository');
const mailService = require('./mail.service');

const login = async (email, password) => {
  try {
    console.log('[AUTH] Inicio login usuario:', email);

    const usuario = await usuarioRepository.findByEmailWithRoles(email);

    if (!usuario) {
      console.warn('[AUTH] Usuario no encontrado:', email);
      throw new Error('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      console.warn('[AUTH] Password inválida para usuario:', email);
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        email: usuario.email,
        roles: usuario.roles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('[AUTH] Login exitoso usuario ID:', usuario.id_usuario);

    return {
      message: 'Login exitoso',
      token, 
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        roles: usuario.roles
      }
    };

  } catch (error) {
    console.error('[AUTH] Error en login:', error.message);
    throw error;
  }
};


const recoverPassword = async (email) => {
  try {
    console.log('[AUTH] Inicio recuperación contraseña para:', email);

    const usuario = await usuarioRepository.findByEmail(email);

    if (!usuario) {
      console.warn('[AUTH] Usuario no encontrado para recuperación:', email);
      throw new Error('El correo no está registrado');
    }

    await mailService.sendRecoverPasswordMail(
      usuario.email,
      usuario.password 
    );

    console.log('[AUTH] Correo de recuperación enviado a usuario ID:', usuario.id_usuario);

    return {
      message: 'La contraseña fue enviada al correo registrado'
    };

  } catch (error) {
    console.error('[AUTH] Error recuperación contraseña:', error.message);
    throw error;
  }
};

module.exports = { login,recoverPassword };
