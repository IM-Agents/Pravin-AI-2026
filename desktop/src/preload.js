const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConnectionStatus: () => ipcRenderer.invoke('get-connection-status'),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  getRecentJobs: () => ipcRenderer.invoke('get-recent-jobs'),
  onStatusUpdate: (callback) => {
    ipcRenderer.on('status-update', (event, data) => callback(data));
  },
  onPrintersUpdate: (callback) => {
    ipcRenderer.on('printers-update', (event, data) => callback(data));
  },
  onJobUpdate: (callback) => {
    ipcRenderer.on('job-update', (event, data) => callback(data));
  }
});
