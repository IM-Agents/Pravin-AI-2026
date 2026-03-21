const { io } = require('socket.io-client');
const config = require('./config');

class SocketClient {
  constructor(printerManager, printExecutor, onStatusChange) {
    this.socket = null;
    this.printerManager = printerManager;
    this.printExecutor = printExecutor;
    this.onStatusChange = onStatusChange;
    this.reconnectAttempts = 0;
    this.printerCheckInterval = null;
  }

  connect() {
    console.log(`Connecting to backend: ${config.backendUrl}`);
    
    this.socket = io(config.backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: config.reconnectInterval,
      reconnectionAttempts: config.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Connected to backend');
      this.reconnectAttempts = 0;
      this.onStatusChange?.('connected');
      
      this.socket.emit('join_electron', { machine_id: config.machineId });
      
      this.syncPrinters();
      this.startPrinterMonitoring();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from backend');
      this.onStatusChange?.('disconnected');
      this.stopPrinterMonitoring();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.reconnectAttempts++;
      this.onStatusChange?.('error');
    });

    this.socket.on('print_job', (job) => {
      console.log('Received print job:', job.job_id);
      this.handlePrintJob(job);
    });

    this.socket.on('cancel_job', (data) => {
      console.log('Received cancel request:', data.job_id);
      this.handleCancelJob(data.job_id);
    });

    return this.socket;
  }

  disconnect() {
    this.stopPrinterMonitoring();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async syncPrinters() {
    const printers = await this.printerManager.detectPrinters();
    
    if (this.socket?.connected) {
      this.socket.emit('printer_sync', {
        machine_id: config.machineId,
        printers
      });
      console.log(`Synced ${printers.length} printers`);
    }
  }

  startPrinterMonitoring() {
    this.stopPrinterMonitoring();
    
    let previousPrinters = [...this.printerManager.getPrinters()];
    
    this.printerCheckInterval = setInterval(async () => {
      const result = await this.printerManager.checkPrinterChanges(previousPrinters);
      
      if (result.hasChanges) {
        console.log('Printer changes detected:', result.changes);
        
        if (this.socket?.connected) {
          this.socket.emit('printer_sync', {
            machine_id: config.machineId,
            printers: result.printers
          });
          
          for (const printer of result.changes.statusChanged) {
            this.socket.emit('printer_status', {
              machine_id: config.machineId,
              printer_name: printer.printer_name,
              status: printer.status
            });
          }
        }
        
        previousPrinters = result.printers;
      }
    }, config.printerCheckInterval);
  }

  stopPrinterMonitoring() {
    if (this.printerCheckInterval) {
      clearInterval(this.printerCheckInterval);
      this.printerCheckInterval = null;
    }
  }

  handlePrintJob(job) {
    const printer = this.printerManager.findPrinter(job.printer_name);
    
    if (!printer) {
      this.sendPrintResult({
        job_id: job.job_id,
        status: 'FAILED',
        message: `Printer not found: ${job.printer_name}`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (printer.status !== 'online') {
      this.sendPrintResult({
        job_id: job.job_id,
        status: 'FAILED',
        message: `Printer is offline: ${job.printer_name}`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    this.printExecutor.executePrint(job, (result) => {
      this.sendPrintResult(result);
    });
  }

  handleCancelJob(jobId) {
    const cancelled = this.printExecutor.cancelJob(jobId);
    
    if (cancelled) {
      this.sendPrintResult({
        job_id: jobId,
        status: 'CANCELLED',
        message: 'Job cancelled',
        timestamp: new Date().toISOString()
      });
    }
  }

  sendPrintResult(result) {
    if (this.socket?.connected) {
      this.socket.emit('print_status_update', result);
      console.log(`Sent print result for job ${result.job_id}: ${result.status}`);
    } else {
      console.warn('Cannot send print result - not connected');
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

module.exports = SocketClient;
