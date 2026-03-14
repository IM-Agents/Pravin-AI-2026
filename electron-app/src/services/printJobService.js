const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const printer = require('printer');
const logger = require('../utils/logger');

class PrintJobService {
  constructor(backendUrl, printerService) {
    this.backendUrl = backendUrl;
    this.printerService = printerService;
    this.processingJobs = new Set();
    this.tempDir = path.join(os.tmpdir(), 'oma-print-jobs');
  }

  async initialize() {
    try {
      // Create temp directory for PDF files
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }

      logger.info('Print job service initialized successfully');
      logger.info(`Temp directory: ${this.tempDir}`);
    } catch (error) {
      logger.error('Failed to initialize print job service:', error);
      throw error;
    }
  }

  async checkPrintJobs() {
    try {
      const machineId = this.printerService.getMachineId();
      
      if (!machineId) {
        logger.warn('Machine ID not available, skipping print job check');
        return;
      }

      // Get pending print jobs from backend
      const response = await axios.get(
        `${this.backendUrl}/api/print-jobs/pending`,
        {
          params: { machine_id: machineId },
          timeout: 10000
        }
      );

      const jobs = response.data.jobs || [];

      if (jobs.length > 0) {
        logger.info(`Found ${jobs.length} pending print jobs`);
        
        // Process each job
        for (const job of jobs) {
          if (!this.processingJobs.has(job.id)) {
            this.processingJobs.add(job.id);
            this.processPrintJob(job).finally(() => {
              this.processingJobs.delete(job.id);
            });
          }
        }
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.warn('Backend not available, will retry on next poll');
      } else {
        logger.error('Failed to check print jobs:', error.message);
      }
    }
  }

  async processPrintJob(job) {
    try {
      logger.info(`Processing print job ${job.id} for order ${job.order_id}`);

      // Download PDF
      const pdfPath = await this.downloadPDF(job);

      // Print PDF
      await this.printPDF(job, pdfPath);

      // Report success
      await this.reportPrintResult(job.id, true, 'Print job completed successfully');

      // Cleanup
      this.cleanupPDF(pdfPath);

      logger.info(`Print job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Failed to process print job ${job.id}:`, error.message);
      
      // Report failure
      await this.reportPrintResult(job.id, false, error.message);
    }
  }

  async downloadPDF(job) {
    try {
      const pdfUrl = `${this.backendUrl}/api/orders/${job.order_id}/department/${job.department}/download-pdf`;
      
      logger.info(`Downloading PDF from ${pdfUrl}`);

      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const fileName = `order_${job.order_id}_${job.department}_${Date.now()}.pdf`;
      const filePath = path.join(this.tempDir, fileName);

      fs.writeFileSync(filePath, response.data);

      logger.info(`PDF downloaded to ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Failed to download PDF:', error.message);
      throw new Error(`PDF download failed: ${error.message}`);
    }
  }

  async printPDF(job, pdfPath) {
    try {
      const printerName = job.printer_name;

      if (!printerName) {
        throw new Error('Printer name not specified in job');
      }

      logger.info(`Printing to ${printerName}`);

      // Check if printer exists
      const printerInfo = this.printerService.getPrinterByName(printerName);
      if (!printerInfo) {
        throw new Error(`Printer ${printerName} not found`);
      }

      // Print using node-printer
      await new Promise((resolve, reject) => {
        printer.printFile({
          filename: pdfPath,
          printer: printerName,
          success: (jobId) => {
            logger.info(`Print job sent successfully. System job ID: ${jobId}`);
            resolve(jobId);
          },
          error: (err) => {
            logger.error('Print error:', err);
            reject(new Error(`Print failed: ${err}`));
          }
        });
      });

      logger.info(`PDF printed successfully to ${printerName}`);
    } catch (error) {
      logger.error('Failed to print PDF:', error.message);
      throw new Error(`Print failed: ${error.message}`);
    }
  }

  async reportPrintResult(jobId, success, message) {
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/print-jobs/${jobId}/result`,
        {
          success: success,
          message: message,
          completed_at: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      logger.info(`Reported print result for job ${jobId}: ${success ? 'SUCCESS' : 'FAILURE'}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to report print result for job ${jobId}:`, error.message);
      // Don't throw - we don't want to fail the job if reporting fails
    }
  }

  cleanupPDF(pdfPath) {
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        logger.debug(`Cleaned up PDF file: ${pdfPath}`);
      }
    } catch (error) {
      logger.warn(`Failed to cleanup PDF file ${pdfPath}:`, error.message);
    }
  }

  cleanupTempDirectory() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          const filePath = path.join(this.tempDir, file);
          fs.unlinkSync(filePath);
        }
        logger.info('Cleaned up temp directory');
      }
    } catch (error) {
      logger.warn('Failed to cleanup temp directory:', error.message);
    }
  }
}

module.exports = PrintJobService;

