const { json } = require('express');
const recordatorioService = require('../services/recordatorio.service');

const ejecutarRecordatorios = async (req,res) => {
  await recordatorioService.ejecutarRecordatorios();
  return res.status(200).json({
    message: 'Ejecución de recordatorios iniciada'
  });
}




module.exports = {
  ejecutarRecordatorios
};
