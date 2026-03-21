const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const PrinterManager = require('./printerManager');
const PrintExecutor = require('./printExecutor');
const SocketClient = require('./socketClient');

let mainWindow = null;
let tray = null;
let printerManager = null;
let printExecutor = null;
let socketClient = null;
let connectionStatus = 'disconnected';
let recentJobs = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'renderer', 'icon.png');
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (e) {
    icon = nativeImage.createEmpty();
  }
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Window', 
      click: () => mainWindow?.show() 
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
  
  tray.setToolTip('OMA Print Agent');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

function initializeServices() {
  printerManager = new PrinterManager();
  printExecutor = new PrintExecutor();
  
  socketClient = new SocketClient(
    printerManager,
    printExecutor,
    (status) => {
      connectionStatus = status;
      mainWindow?.webContents.send('status-update', { status });
    }
  );
  
  socketClient.connect();
}

function setupIpcHandlers() {
  ipcMain.handle('get-connection-status', () => {
    return connectionStatus;
  });
  
  ipcMain.handle('get-printers', () => {
    return printerManager?.getPrinters() || [];
  });
  
  ipcMain.handle('get-recent-jobs', () => {
    return recentJobs.slice(-20);
  });
}

function addJobToHistory(job) {
  recentJobs.push({
    ...job,
    timestamp: new Date().toISOString()
  });
  
  if (recentJobs.length > 100) {
    recentJobs = recentJobs.slice(-100);
  }
  
  mainWindow?.webContents.send('job-update', { jobs: recentJobs.slice(-20) });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupIpcHandlers();
  initializeServices();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  socketClient?.disconnect();
});
