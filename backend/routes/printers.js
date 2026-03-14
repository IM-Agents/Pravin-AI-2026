const express = require('express');
const router = express.Router();
const PrinterController = require('../controllers/printerController');

router.post('/sync', PrinterController.syncPrinters);
router.post('/status', PrinterController.updatePrinterStatus);
router.get('/', PrinterController.getAllPrinters);
router.post('/assign', PrinterController.assignPrinter);
router.post('/toggle-active', PrinterController.togglePrinterActive);

module.exports = router;
