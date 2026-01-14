const usuarioRepository = require('../repositories/usuario.repository');
const residenteRepository = require('../repositories/residente.repository');
const mailService = require('./mail.service');  
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const edificioRepo = require('../repositories/edificio.repository');
const deptoRepo = require('../repositories/departamento.repository');
const auditoriaRepository = require('../repositories/auditoria.repository');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidTelefono = (telefono) => /^\+?[0-9]{8,15}$/.test(telefono);
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

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
      await mailService.sendUsuarioNuevoMail(
        data.email,
        passwordTemporal
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

const editarUsuario = async (idUsuario, data) => {
  const connection = await pool.getConnection();
  let transactionActive = false;
  try {
    console.log('[ADMIN] Editando usuario:', idUsuario);
    
    await connection.beginTransaction();
    transactionActive = true;

    const usuarioActual = await usuarioRepository.findById(idUsuario, connection);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }

    const usuarioData = {};
    if (data.email !== undefined) {
      usuarioData.email = data.email;
    }
    if (data.activo !== undefined) {
      usuarioData.activo = data.activo;
    }
    if (Object.keys(usuarioData).length > 0) {
      await usuarioRepository.actualizarUsuarioDatos(idUsuario, usuarioData, connection);
    }

    if (data.rol !== undefined) {
      await usuarioRepository.actualizarRolUsuario(idUsuario, data.rol, connection);
    }

    const residenteData = {};
    if (data.nombre !== undefined) {
      residenteData.nombre = data.nombre;
    }
    if (data.rut !== undefined) {
      residenteData.rut = data.rut;
    }
    if (data.telefono !== undefined) {
      residenteData.telefono = data.telefono;
    }
    if (data.id_departamento !== undefined) {
      residenteData.id_departamento = data.id_departamento;
    }
    if (data.email !== undefined) {
      residenteData.email = data.email;
    }
    if (data.is_active !== undefined) {
      residenteData.activo = data.is_active;
    }
    if (Object.keys(residenteData).length > 0) {
      await residenteRepository.actualizarPorEmail(
        usuarioActual.email,
        residenteData,
        connection
      );
    }

    await connection.commit();
    transactionActive = false;

    return { message: 'Usuario actualizado correctamente' };

  } catch (error) {
    if (transactionActive) {
      await connection.rollback();
    }
    console.error('[ADMIN] Error editar usuario:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

const guardarEstructura = async (edificio, departamentos) => {
  const conn = await pool.getConnection();
  try {
    console.log('[ADMIN] Guardando estructura edificio + departamentos');
    await conn.beginTransaction();

    
    const idEdificio = await edificioRepo.upsert(conn, edificio);


    const existentes = await deptoRepo.listByEdificio(conn, idEdificio);
    const incomingIds = new Set(
      departamentos
        .map((d) => d.id_departamento)
        .filter((id) => id !== undefined && id !== null)
    );

    for (const existente of existentes) {
      if (!incomingIds.has(existente.id_departamento)) {
        const result = await deptoRepo.deleteIfNoResidente(
          conn,
          existente.id_departamento
        );
        if (result.affectedRows === 0) {
          throw new Error('No se puede eliminar un departamento asignado a un residente');
        }
      }
    }

    for (const d of departamentos) {
      if (!d.numero || d.piso === undefined || d.piso === null) {
        throw new Error('Datos de departamento incompletos');
      }

      if (d.id_departamento) {
        await deptoRepo.update(conn, {
          id_departamento: d.id_departamento,
          numero: d.numero,
          piso: d.piso,
          id_edificio: idEdificio
        });
      } else {
        await deptoRepo.insert(conn, {
          numero: d.numero,
          piso: d.piso,
          id_edificio: idEdificio
        });
      }
    }

    await conn.commit();
    console.log('[ADMIN] Estructura guardada OK');
    return { message: 'Estructura guardada correctamente' };

  } catch (error) {
    await conn.rollback();
    console.error('[ADMIN] Error guardar estructura:', error.message);
    throw error;
  } finally {
    conn.release();
  }
};

const obtenerEstructura = async () => {
  try {
    const edificio = await edificioRepo.findFirst();
    if (!edificio) {
      return { edificio: null, departamentos: [] };
    }

    const departamentos = await deptoRepo.listByEdificio(pool, edificio.id_edificio);
    return { edificio, departamentos };
  } catch (error) {
    console.error('[ADMIN] Error obtener estructura:', error.message);
    throw error;
  }
};

const listarDepartamentos = async () => {
  try {
    const edificio = await edificioRepo.findFirst();
    if (!edificio) {
      return { edificio: null, departamentos: [] };
    }

    const departamentos = await deptoRepo.listByEdificio(pool, edificio.id_edificio);
    return { edificio, departamentos };
  } catch (error) {
    console.error('[ADMIN] Error listar departamentos:', error.message);
    throw error;
  }
};

const actualizarUsuarioPerfil = async (idUsuario, data) => {
  const connection = await pool.getConnection();
  let transactionActive = false;
  try {
    const usuarioActual = await usuarioRepository.findById(idUsuario, connection);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }

    const email = data.email;
    const telefono = data.telefono;
    const passwordNueva = data.password_nueva;
    const passwordConfirmacion = data.password_confirmacion;

    if (!email || typeof email !== 'string') {
      throw new Error('Email invalido');
    }
    const emailNormalizado = email.trim().toLowerCase();
    if (!isValidEmail(emailNormalizado)) {
      throw new Error('Email invalido');
    }

    if (telefono === undefined || typeof telefono !== 'string') {
      throw new Error('Telefono invalido');
    }
    let telefonoNormalizado = telefono.trim();
    if (telefonoNormalizado !== '' && !isValidTelefono(telefonoNormalizado)) {
      throw new Error('Telefono invalido');
    }
    if (telefonoNormalizado === '') {
      telefonoNormalizado = null;
    }

    if (emailNormalizado !== usuarioActual.email) {
      const existente = await usuarioRepository.findByEmail(emailNormalizado, connection);
      if (existente && existente.id_usuario !== Number(idUsuario)) {
        throw new Error('El correo ya esta registrado');
      }
    }

    const passwordProvided =
      passwordNueva !== undefined || passwordConfirmacion !== undefined;

    if (passwordProvided) {
      if (!passwordNueva || !passwordConfirmacion) {
        throw new Error('Datos de password incompletos');
      }
      if (passwordNueva !== passwordConfirmacion) {
        throw new Error('Las contrasenas no coinciden');
      }
      if (!isStrongPassword(passwordNueva)) {
        throw new Error('Contrasena debil');
      }
    }

    const residenteActual = await residenteRepository.findByEmail(
      usuarioActual.email,
      connection
    );
    if (!residenteActual) {
      throw new Error('Residente no encontrado');
    }

    await connection.beginTransaction();
    transactionActive = true;

    if (emailNormalizado !== usuarioActual.email) {
      await usuarioRepository.actualizarUsuarioDatos(
        idUsuario,
        { email: emailNormalizado },
        connection
      );
    }

    await residenteRepository.actualizarPorEmail(
      usuarioActual.email,
      { email: emailNormalizado, telefono: telefonoNormalizado },
      connection
    );

    if (passwordProvided) {
      const hash = await bcrypt.hash(passwordNueva, 10);
      await usuarioRepository.actualizarPassword(idUsuario, hash, connection);
    }

    await connection.commit();
    transactionActive = false;

    return { message: 'Usuario actualizado correctamente' };
  } catch (error) {
    if (transactionActive) {
      await connection.rollback();
    }
    console.error('[ADMIN] Error actualizar perfil usuario:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

const listarAuditoria = async () => {
  try {
    console.log('[ADMIN] Listando auditoría');

    const rows = await auditoriaRepository.findAll();

    
    return rows.map(r => ({
      fecha_hora: r.fecha_evento,
      usuario: r.usuario_nombre,
      rol: r.rol,
      accion: r.accion,
      detalle: r.detalle
    }));

  } catch (error) {
    console.error('[ADMIN] Error auditoría:', error.message);
    throw error;
  }
};

const obtenerUsuarioResumen = async (idUsuario) => {
  try {
    console.log('[ADMIN] Buscando resumen usuario:', idUsuario);

    const row = await usuarioRepository.findResumenById(idUsuario);
    if (!row) {
      throw new Error('Usuario no encontrado');
    }

    return {
      usuario: row.usuario,
      rol: row.rol,
      correo: row.email,
      telefono: row.telefono
    };
  } catch (error) {
    console.error('[ADMIN] Error resumen usuario:', error.message);
    throw error;
  }
};


module.exports = { countAllUsers, listarUsuarios, 
                  crearUsuario, cambiarEstado, resetPassword, 
                  editarUsuario, guardarEstructura, obtenerEstructura, listarDepartamentos, listarAuditoria,
                  obtenerUsuarioResumen, actualizarUsuarioPerfil };
