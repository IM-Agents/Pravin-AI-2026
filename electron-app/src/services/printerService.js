const { machineIdSync } = require('node-machine-id');
const axios = require('axios');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class PrinterService {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
    this.machineId = null;
    this.detectedPrinters = [];
    this.lastSyncTime = null;
    this.platform = process.platform;
  }

  async initialize() {
    try {
      // Get unique machine ID
      this.machineId = machineIdSync();
      logger.info(`Machine ID: ${this.machineId}`);
      logger.info(`Platform: ${this.platform}`);

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
      let printers = [];

      if (this.platform === 'win32') {
        printers = await this.detectWindowsPrinters();
      } else if (this.platform === 'darwin') {
        printers = await this.detectMacPrinters();
      } else if (this.platform === 'linux') {
        printers = await this.detectLinuxPrinters();
      } else {
        logger.warn(`Unsupported platform: ${this.platform}`);
        return [];
      }

      this.detectedPrinters = printers.map(p => ({
        printer_id: p.name,
        printer_name: p.name,
        machine_id: this.machineId,
        status: p.status || 'online',
        metadata: {
          driver: p.driver || 'Unknown',
          port: p.port || 'Unknown',
          isDefault: p.isDefault || false
        }
      }));

      logger.info(`Detected ${this.detectedPrinters.length} printers`);
      return this.detectedPrinters;
    } catch (error) {
      logger.error('Failed to detect printers:', error);
      return [];
    }
  }

  async detectWindowsPrinters() {
    try {
      const { stdout } = await execPromise('wmic printer get name,status,default /format:csv');
      const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('Node'));
      
      return lines.map(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
          return {
            name: parts[2] ? parts[2].trim() : 'Unknown',
            status: parts[3] && parts[3].toLowerCase().includes('ok') ? 'online' : 'offline',
            isDefault: parts[1] && parts[1].toLowerCase() === 'true'
          };
        }
        return null;
      }).filter(p => p && p.name !== 'Unknown');
    } catch (error) {
      logger.error('Failed to detect Windows printers:', error);
      return [];
    }
  }

  async detectMacPrinters() {
    try {
      const { stdout } = await execPromise('lpstat -p');
      const lines = stdout.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const match = line.match(/printer\s+(\S+)\s+(.+)/);
        if (match) {
          return {
            name: match[1],
            status: match[2].includes('idle') || match[2].includes('enabled') ? 'online' : 'offline',
            isDefault: false
          };
        }
        return null;
      }).filter(p => p);
    } catch (error) {
      logger.error('Failed to detect Mac printers:', error);
      return [];
    }
  }

  async detectLinuxPrinters() {
    try {
      const { stdout } = await execPromise('lpstat -p');
      const lines = stdout.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const match = line.match(/printer\s+(\S+)\s+(.+)/);
        if (match) {
          return {
            name: match[1],
            status: match[2].includes('idle') || match[2].includes('enabled') ? 'online' : 'offline',
            isDefault: false
          };
        }
        return null;
      }).filter(p => p);
    } catch (error) {
      logger.error('Failed to detect Linux printers:', error);
      return [];
    }
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
