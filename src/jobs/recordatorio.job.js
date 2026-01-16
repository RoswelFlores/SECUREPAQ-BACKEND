const cron = require('node-cron');
const recordatorioService = require('../services/recordatorio.service');


cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Job recordatorio iniciado');
  await recordatorioService.ejecutarRecordatorios();
});