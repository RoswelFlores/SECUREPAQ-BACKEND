const recordatorioService = require('../services/recordatorio.service');

const ejecutarRecordatorios = async () => {
  await recordatorioService.ejecutarRecordatorios();
}




module.exports = {
  ejecutarRecordatorios
};
