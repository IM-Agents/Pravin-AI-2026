const express = require('express');
const router = express.Router();
const printerController = require('../controllers/printerController');

router.post('/sync', printerController.syncPrinters);
router.get('/', printerController.getAllPrinters);
router.post('/status', printerController.updatePrinterStatus);
router.patch('/:printer_id/assign', printerController.assignPrinterToDepartment);
router.patch('/:printer_id/active', printerController.togglePrinterActive);

module.exports = router;
