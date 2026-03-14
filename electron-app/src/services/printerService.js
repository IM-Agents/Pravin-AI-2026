const printer = require('printer');
const { machineIdSync } = require('node-machine-id');
const axios = require('axios');
const logger = require('../utils/logger');

class PrinterService {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
    this.machineId = null;
    this.detectedPrinters = [];
    this.lastSyncTime = null;
  }

  async initialize() {
    try {
      // Get unique machine ID
      this.machineId = machineIdSync();
      logger.info(`Machine ID: ${this.machineId}`);

      // Initial printer detection
      await this.detectPrinters();

      // Initial sync with backend
      await this.syncPrinters();

      logger.info('Printer service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize printer service:', error);
      throw error;
    }
  }

  async detectPrinters() {
    try {
      const printers = printer.getPrinters();
      
      this.detectedPrinters = printers.map(p => ({
        printer_id: p.name,
        printer_name: p.name,
        machine_id: this.machineId,
        status: this.getPrinterStatus(p),
        metadata: {
          driver: p.driver || 'Unknown',
          port: p.port || 'Unknown',
          isDefault: p.isDefault || false,
          options: p.options || {}
        }
      }));

      logger.info(`Detected ${this.detectedPrinters.length} printers`);
      return this.detectedPrinters;
    } catch (error) {
      logger.error('Failed to detect printers:', error);
      return [];
    }
  }

  getPrinterStatus(printerInfo) {
    // Check if printer is available/online
    // This is a simplified check - actual implementation may vary by OS
    if (printerInfo.status && printerInfo.status.includes('offline')) {
      return 'offline';
    }
    return 'online';
  }

  async syncPrinters() {
    try {
      // Detect current printers
      await this.detectPrinters();

      if (this.detectedPrinters.length === 0) {
        logger.warn('No printers detected to sync');
        return;
      }

      // Send to backend
      const response = await axios.post(
        `${this.backendUrl}/api/printers/sync`,
        {
          machine_id: this.machineId,
          printers: this.detectedPrinters
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      this.lastSyncTime = new Date();
      logger.info(`Synced ${this.detectedPrinters.length} printers with backend`);
      logger.debug('Sync response:', response.data);

      return response.data;
    } catch (error) {
      logger.error('Failed to sync printers with backend:', error.message);
      if (error.response) {
        logger.error('Backend response:', error.response.data);
      }
      throw error;
    }
  }

  async updatePrinterStatus(printerId, status) {
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/printers/status`,
        {
          machine_id: this.machineId,
          printer_id: printerId,
          status: status
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      logger.info(`Updated printer ${printerId} status to ${status}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update printer status for ${printerId}:`, error.message);
      throw error;
    }
  }

  getDetectedPrinters() {
    return this.detectedPrinters;
  }

  getMachineId() {
    return this.machineId;
  }

  getLastSyncTime() {
    return this.lastSyncTime;
  }

  getPrinterByName(printerName) {
    return this.detectedPrinters.find(p => p.printer_name === printerName);
  }
}

module.exports = PrinterService;

