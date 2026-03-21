const { BrowserWindow } = require('electron');

class PrinterManager {
  constructor() {
    this.printers = [];
    this.lastSync = null;
  }

  async detectPrinters() {
    try {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length === 0) {
        return [];
      }

      const printers = await windows[0].webContents.getPrintersAsync();
      
      this.printers = printers.map(printer => ({
        printer_name: printer.name,
        is_default: printer.isDefault,
        status: printer.status === 0 ? 'online' : 'offline'
      }));

      this.lastSync = new Date();
      return this.printers;
    } catch (error) {
      console.error('Failed to detect printers:', error);
      return this.printers;
    }
  }

  getPrinters() {
    return this.printers;
  }

  findPrinter(printerName) {
    return this.printers.find(p => p.printer_name === printerName);
  }

  async checkPrinterChanges(previousPrinters) {
    const currentPrinters = await this.detectPrinters();
    
    const changes = {
      added: [],
      removed: [],
      statusChanged: []
    };

    const prevNames = new Set(previousPrinters.map(p => p.printer_name));
    const currNames = new Set(currentPrinters.map(p => p.printer_name));

    for (const printer of currentPrinters) {
      if (!prevNames.has(printer.printer_name)) {
        changes.added.push(printer);
      } else {
        const prev = previousPrinters.find(p => p.printer_name === printer.printer_name);
        if (prev && prev.status !== printer.status) {
          changes.statusChanged.push(printer);
        }
      }
    }

    for (const printer of previousPrinters) {
      if (!currNames.has(printer.printer_name)) {
        changes.removed.push(printer);
      }
    }

    return {
      hasChanges: changes.added.length > 0 || changes.removed.length > 0 || changes.statusChanged.length > 0,
      changes,
      printers: currentPrinters
    };
  }
}

module.exports = PrinterManager;
