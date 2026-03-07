const printerService = require('../../services/printerService');
const printQueueService = require('../../services/printQueueService');
const logger = require('../../utils/logger');

exports.discoverPrinters = async (req, res) => {
  try {
    const printers = await printerService.discoverPrinters();
    res.json({ success: true, data: printers });
  } catch (error) {
    logger.error('Error discovering printers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPrinterConfigs = async (req, res) => {
  try {
    const { store_client_id = 1 } = req.query;
    const configs = await printerService.getAllPrinterConfigs(store_client_id);
    res.json({ success: true, data: configs });
  } catch (error) {
    logger.error('Error fetching printer configs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.savePrinterConfig = async (req, res) => {
  try {
    const config = await printerService.savePrinterConfig(req.body);
    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error saving printer config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePrinterStatus = async (req, res) => {
  try {
    const { department } = req.params;
    const { store_client_id = 1 } = req.body;

    const config = await printerService.updatePrinterStatus(store_client_id, department);

    if (!config) {
      return res.status(404).json({ success: false, error: 'Printer config not found' });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    logger.error('Error updating printer status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQueueStats = async (req, res) => {
  try {
    const stats = await printQueueService.getAllQueueStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching queue stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};