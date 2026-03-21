const { BrowserWindow } = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const config = require('./config');

class PrintExecutor {
  constructor() {
    this.activeJobs = new Map();
    this.tempDir = path.join(os.tmpdir(), 'oma-prints');
    
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async executePrint(job, onComplete) {
    const { job_id, order_id, department, printer_name, pdf_url, template_type } = job;
    
    console.log(`Starting print job: ${job_id} for ${department}`);
    
    this.activeJobs.set(job_id, {
      ...job,
      status: 'downloading',
      startTime: new Date()
    });

    try {
      const pdfPath = await this.downloadPdf(pdf_url, job_id);
      
      this.activeJobs.get(job_id).status = 'printing';
      
      await this.printFile(pdfPath, printer_name);
      
      this.cleanupTempFile(pdfPath);
      
      this.activeJobs.delete(job_id);
      
      console.log(`Print job completed: ${job_id}`);
      
      onComplete({
        job_id,
        status: 'SUCCESS',
        message: 'Printed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Print job failed: ${job_id}`, error);
      
      this.activeJobs.delete(job_id);
      
      onComplete({
        job_id,
        status: 'FAILED',
        message: error.message || 'Print failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  async downloadPdf(pdfUrl, jobId) {
    const fullUrl = `${config.backendUrl}${pdfUrl}`;
    const filePath = path.join(this.tempDir, `${jobId}.pdf`);
    
    console.log(`Downloading PDF from: ${fullUrl}`);
    
    const response = await axios({
      method: 'GET',
      url: fullUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  }

  async printFile(filePath, printerName) {
    return new Promise((resolve, reject) => {
      const windows = BrowserWindow.getAllWindows();
      
      if (windows.length === 0) {
        reject(new Error('No window available for printing'));
        return;
      }

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      printWindow.loadFile(filePath)
        .then(() => {
          printWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: printerName
          }, (success, failureReason) => {
            printWindow.close();
            
            if (success) {
              resolve();
            } else {
              reject(new Error(failureReason || 'Print failed'));
            }
          });
        })
        .catch((error) => {
          printWindow.close();
          reject(error);
        });
    });
  }

  cancelJob(jobId) {
    if (this.activeJobs.has(jobId)) {
      const job = this.activeJobs.get(jobId);
      
      if (job.status === 'downloading') {
        this.activeJobs.delete(jobId);
        return true;
      }
    }
    return false;
  }

  cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Failed to cleanup temp file:', error);
    }
  }

  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }
}

module.exports = PrintExecutor;
