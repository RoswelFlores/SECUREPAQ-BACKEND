const encomiendaRepository = require('../repositories/encomienda.repository');
const auditoriaService = require('./auditoria.service');
const otpService = require('./otp.service');
const mailService = require('./mail.service');

const registrarEncomienda = async (data, usuario) => {
  try {
    console.log('[ENCOMIENDA] Inicio registro, conserje ID:', usuario.id);

    const {
      id_residente,
      id_courier,
      tracking,
      tipo_paquete,
      tamanio,
      descripcion,
      fecha_recepcion,
      hora_recepcion
    } = data;

    if (!id_residente || !id_courier || !tracking || !tipo_paquete || !tamanio) {
      throw new Error('Datos obligatorios incompletos');
    }

    const fechaHoraRecepcion = `${fecha_recepcion} ${hora_recepcion}`;

   
    const idEncomienda = await encomiendaRepository.insertar({
      id_residente,
      id_courier,
      tracking,
      tipo_paquete,
      tamanio,
      descripcion,
      fechaHoraRecepcion
    });

   
    const otp = await otpService.generarYGuardarOTP(idEncomienda);

    
    await auditoriaService.registrar(
      'REGISTRO_ENCOMIENDA',
      usuario.email,
      idEncomienda
    );

   
    await mailService.sendNuevaEncomiendaMail(id_residente, otp);

    console.log('[ENCOMIENDA] Registro exitoso ID:', idEncomienda);

    return {
      message: 'Encomienda registrada correctamente',
      id_encomienda: idEncomienda
    };

  } catch (error) {
    console.error('[ENCOMIENDA] Error registro:', error.message);
    throw error;
  }
};

module.exports = { registrarEncomienda };
