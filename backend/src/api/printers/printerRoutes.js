const express = require('express');
const router = express.Router();
const printerController = require('./printerController');

router.get('/discover', printerController.discoverPrinters);
router.get('/configs', printerController.getPrinterConfigs);
router.post('/configs', printerController.savePrinterConfig);
router.post('/configs/:department/status', printerController.updatePrinterStatus);
router.get('/queue/stats', printerController.getQueueStats);

module.exports = router;