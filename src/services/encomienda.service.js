const encomiendaRepository = require('../repositories/encomienda.repository');
const auditoriaService = require('./auditoria.service');
const otpService = require('./otp.service');
const otpRepository = require('../repositories/otp.repository');
const mailService = require('./mail.service');

const formatUtcDateTime = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const buildFechaHoraRecepcion = ({
  fecha_recepcion,
  hora_recepcion,
  fecha_recepcion_utc,
  timezone_offset
}) => {
  if (fecha_recepcion_utc) {
    const parsed = new Date(fecha_recepcion_utc);
    const formatted = formatUtcDateTime(parsed);
    if (formatted) return formatted;
  }

  const hasOffset =
    timezone_offset !== undefined &&
    timezone_offset !== null &&
    timezone_offset !== '';
  const offsetMinutes = hasOffset ? Number(timezone_offset) : NaN;
  if (Number.isFinite(offsetMinutes) && fecha_recepcion && hora_recepcion) {
    const [year, month, day] = String(fecha_recepcion).split('-').map(Number);
    const [hourRaw, minuteRaw, secondRaw = '0'] = String(hora_recepcion).split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const second = Number(secondRaw);

    if (![year, month, day, hour, minute, second].some(Number.isNaN)) {
      const utcMs = Date.UTC(year, month - 1, day, hour, minute, second)
        + offsetMinutes * 60 * 1000;
      const formatted = formatUtcDateTime(new Date(utcMs));
      if (formatted) return formatted;
    }
  }

  if (fecha_recepcion && hora_recepcion) {
    return `${fecha_recepcion} ${hora_recepcion}`;
  }

  return null;
};

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
      hora_recepcion,
      fecha_recepcion_utc,
      timezone_offset
    } = data;

    if (!id_residente || !id_courier || !tracking || !tipo_paquete || !tamanio) {
      throw new Error('Datos obligatorios incompletos');
    }

    const fechaHoraRecepcion = buildFechaHoraRecepcion({
      fecha_recepcion,
      hora_recepcion,
      fecha_recepcion_utc,
      timezone_offset
    });

   
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

   
    await mailService.sendNuevaEncomiendaMail(id_residente, otp , idEncomienda);

    console.log('[ENCOMIENDA] Registro exitoso ID:', idEncomienda);

    return {
      message: 'Encomienda registrada correctamente',
      id_encomienda: idEncomienda
    };

  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      console.error('[ENCOMIENDA] Error registro: tracking duplicado');
      const duplicateError = new Error('El tracking ya esta registrado. Usa uno diferente.');
      duplicateError.status = 409;
      throw duplicateError;
    }

    console.error('[ENCOMIENDA] Error registro:', error.message);
    throw error;
  }
};
const confirmarRetiro = async (idEncomienda, observacion, usuario) => {
  try {
    console.log('[RETIRO] Confirmando retiro encomienda ID:', idEncomienda);

    const otp = await otpRepository.findByCodigoValidoPorEncomienda(idEncomienda);

    if (!otp) {
      throw new Error('No existe OTP válido para esta encomienda');
    }

    
    await otpRepository.marcarComoUsado(otp.id_otp);

    observacion = observacion || '';

    await encomiendaRepository.actualizarEstado(idEncomienda,observacion, 'RETIRADA');

  
    await auditoriaService.registrar(
      'RETIRO_ENCOMIENDA',
      usuario.email,
      idEncomienda
    );

    
    const idResidente = await encomiendaRepository.findResidenteByEncomienda(idEncomienda);
    await mailService.sendRetiroConfirmadoMail(idResidente,idEncomienda);

    console.log('[RETIRO] Retiro confirmado encomienda ID:', idEncomienda);

    return {
      message: 'Encomienda retirada correctamente'
    };

  } catch (error) {
    console.error('[RETIRO] Error retiro:', error.message);
    throw error;
  }
};

module.exports = { registrarEncomienda, confirmarRetiro };
