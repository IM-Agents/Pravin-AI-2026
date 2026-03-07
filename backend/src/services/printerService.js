const printer = require('node-printer');
const { PrinterConfig } = require('../models');
const logger = require('../utils/logger');

class PrinterService {
  async discoverPrinters() {
    try {
      const printers = printer.getPrinters();
      logger.info(`Discovered ${printers.length} printers`);
      return printers;
    } catch (error) {
      logger.error('Error discovering printers:', error);
      throw error;
    }
  }

  async getPrinterConfig(storeClientId, department) {
    try {
      const config = await PrinterConfig.findOne({
        where: {
          store_client_id: storeClientId,
          department: department.toUpperCase()
        }
      });

      return config;
    } catch (error) {
      logger.error(`Error fetching printer config for ${department}:`, error);
      throw error;
    }
  }

  async getAllPrinterConfigs(storeClientId) {
    try {
      const configs = await PrinterConfig.findAll({
        where: { store_client_id: storeClientId }
      });

      return configs;
    } catch (error) {
      logger.error('Error fetching printer configs:', error);
      throw error;
    }
  }

  async savePrinterConfig(configData) {
    try {
      const {
        store_client_id,
        department,
        printer_name,
        printer_id,
        printer_uri,
        printer_settings
      } = configData;

      const [config, created] = await PrinterConfig.upsert({
        store_client_id,
        department: department.toUpperCase(),
        printer_name,
        printer_id,
        printer_uri,
        printer_settings,
        is_active: true
      });

      logger.info(`Printer config ${created ? 'created' : 'updated'} for ${department}`);
      return config;
    } catch (error) {
      logger.error('Error saving printer config:', error);
      throw error;
    }
  }

  async checkPrinterStatus(printerName) {
    try {
      const printers = printer.getPrinters();
      const targetPrinter = printers.find(p => p.name === printerName);

      if (!targetPrinter) {
        return { online: false, status: 'NOT_FOUND' };
      }

      return {
        online: targetPrinter.status === 'IDLE' || targetPrinter.status === 'PRINTING',
        status: targetPrinter.status,
        details: targetPrinter
      };
    } catch (error) {
      logger.error(`Error checking printer status for ${printerName}:`, error);
      return { online: false, status: 'ERROR', error: error.message };
    }
  }

  async updatePrinterStatus(storeClientId, department) {
    try {
      const config = await this.getPrinterConfig(storeClientId, department);
      
      if (!config) {
        logger.warn(`No printer config found for ${department}`);
        return null;
      }

      const status = await this.checkPrinterStatus(config.printer_name);

      await config.update({
        is_online: status.online,
        last_status_check: new Date()
      });

      logger.info(`Updated printer status for ${department}: ${status.online ? 'ONLINE' : 'OFFLINE'}`);
      return config;
    } catch (error) {
      logger.error(`Error updating printer status for ${department}:`, error);
      throw error;
    }
  }

  async printPDF(printerName, pdfPath, options = {}) {
    try {
      logger.info(`Printing PDF ${pdfPath} to ${printerName}`);

      return new Promise((resolve, reject) => {
        printer.printFile({
          filename: pdfPath,
          printer: printerName,
          success: (jobId) => {
            logger.info(`Print job ${jobId} sent successfully to ${printerName}`);
            resolve({ success: true, jobId });
          },
          error: (error) => {
            logger.error(`Print job failed for ${printerName}:`, error);
            reject(error);
          },
          ...options
        });
      });
    } catch (error) {
      logger.error(`Error printing to ${printerName}:`, error);
      throw error;
    }
  }
}

module.exports = new PrinterService();