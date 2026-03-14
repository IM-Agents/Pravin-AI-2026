const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const PrinterService = require('./services/printerService');
const PrintJobService = require('./services/printJobService');
const logger = require('./utils/logger');

let mainWindow = null;
let tray = null;
let printerService = null;
let printJobService = null;

// Load environment variables
require('dotenv').config();

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';
const PRINTER_SYNC_INTERVAL = parseInt(process.env.PRINTER_SYNC_INTERVAL) || 300000; // 5 minutes
const PRINT_JOB_POLL_INTERVAL = parseInt(process.env.PRINT_JOB_POLL_INTERVAL) || 5000; // 5 seconds

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false // Start hidden
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Hide window instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    {
      label: 'Sync Printers Now',
      click: async () => {
        if (printerService) {
          await printerService.syncPrinters();
        }
      }
    },
    {
      label: 'Check Print Jobs',
      click: async () => {
        if (printJobService) {
          await printJobService.checkPrintJobs();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('OMA Printer Service');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
}

async function initializeServices() {
  try {
    logger.info('Initializing services...');

    // Initialize printer service
    printerService = new PrinterService(BACKEND_API_URL);
    await printerService.initialize();

    // Start printer sync interval
    setInterval(async () => {
      await printerService.syncPrinters();
    }, PRINTER_SYNC_INTERVAL);

    logger.info(`Printer sync interval set to ${PRINTER_SYNC_INTERVAL}ms`);

    // Initialize print job service
    printJobService = new PrintJobService(BACKEND_API_URL, printerService);
    await printJobService.initialize();

    // Start print job polling
    setInterval(async () => {
      await printJobService.checkPrintJobs();
    }, PRINT_JOB_POLL_INTERVAL);

    logger.info(`Print job polling interval set to ${PRINT_JOB_POLL_INTERVAL}ms`);

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
  }
}

// IPC handlers
ipcMain.handle('get-printers', async () => {
  if (printerService) {
    return printerService.getDetectedPrinters();
  }
  return [];
});

ipcMain.handle('sync-printers', async () => {
  if (printerService) {
    await printerService.syncPrinters();
    return { success: true };
  }
  return { success: false, error: 'Printer service not initialized' };
});

ipcMain.handle('get-logs', async () => {
  return logger.getLogs();
});

// App lifecycle
app.whenReady().then(async () => {
  createWindow();
  createTray();
  await initializeServices();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit on window close, keep running in tray
  if (process.platform !== 'darwin') {
    // On macOS, keep app running even when all windows are closed
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

