const auditoriaRepository = require('../repositories/auditoria.repository');

const registrar = async (accion, usuario, idEncomienda) => {
  await auditoriaRepository.insertar({
    accion,
    usuario,
    idEncomienda
  });
};

module.exports = { registrar };
