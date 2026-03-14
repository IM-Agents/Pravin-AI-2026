const { ipcRenderer } = require('electron');

// DOM elements
const machineIdEl = document.getElementById('machine-id');
const lastSyncEl = document.getElementById('last-sync');
const printerCountEl = document.getElementById('printer-count');
const printersListEl = document.getElementById('printers-list');
const logsContainerEl = document.getElementById('logs-container');
const syncBtn = document.getElementById('sync-btn');
const refreshLogsBtn = document.getElementById('refresh-logs-btn');

// State
let printers = [];
let logs = [];

// Initialize
async function initialize() {
  await loadPrinters();
  await loadLogs();

  // Set up auto-refresh
  setInterval(loadPrinters, 30000); // Refresh printers every 30 seconds
  setInterval(loadLogs, 10000); // Refresh logs every 10 seconds
}

// Load printers
async function loadPrinters() {
  try {
    printers = await ipcRenderer.invoke('get-printers');
    renderPrinters();
  } catch (error) {
    console.error('Failed to load printers:', error);
    printersListEl.innerHTML = '<p class="error">Failed to load printers</p>';
  }
}

// Render printers
function renderPrinters() {
  if (!printers || printers.length === 0) {
    printersListEl.innerHTML = '<p class="empty">No printers detected</p>';
    printerCountEl.textContent = '0';
    return;
  }

  printerCountEl.textContent = printers.length;

  const html = printers.map(printer => `
    <div class="printer-card">
      <div class="printer-header">
        <h3>${printer.printer_name}</h3>
        <span class="status-badge ${printer.status}">${printer.status}</span>
      </div>
      <div class="printer-details">
        <div class="detail-row">
          <span class="label">Printer ID:</span>
          <span class="value">${printer.printer_id}</span>
        </div>
        <div class="detail-row">
          <span class="label">Machine ID:</span>
          <span class="value">${printer.machine_id}</span>
        </div>
        ${printer.metadata ? `
          <div class="detail-row">
            <span class="label">Driver:</span>
            <span class="value">${printer.metadata.driver || 'Unknown'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Port:</span>
            <span class="value">${printer.metadata.port || 'Unknown'}</span>
          </div>
          ${printer.metadata.isDefault ? '<div class="default-badge">Default Printer</div>' : ''}
        ` : ''}
      </div>
    </div>
  `).join('');

  printersListEl.innerHTML = html;

  // Update machine ID if available
  if (printers.length > 0 && printers[0].machine_id) {
    machineIdEl.textContent = printers[0].machine_id;
  }
}

// Load logs
async function loadLogs() {
  try {
    logs = await ipcRenderer.invoke('get-logs');
    renderLogs();
  } catch (error) {
    console.error('Failed to load logs:', error);
    logsContainerEl.innerHTML = '<p class="error">Failed to load logs</p>';
  }
}

// Render logs
function renderLogs() {
  if (!logs || logs.length === 0) {
    logsContainerEl.innerHTML = '<p class="empty">No logs available</p>';
    return;
  }

  // Show last 50 logs
  const recentLogs = logs.slice(-50).reverse();

  const html = recentLogs.map(log => `
    <div class="log-entry ${log.level.toLowerCase()}">
      <span class="log-timestamp">${formatTimestamp(log.timestamp)}</span>
      <span class="log-level">${log.level}</span>
      <span class="log-message">${escapeHtml(log.message)}</span>
    </div>
  `).join('');

  logsContainerEl.innerHTML = html;

  // Update last sync time if available
  const lastSyncLog = logs.find(log => log.message.includes('Synced') && log.message.includes('printers'));
  if (lastSyncLog) {
    lastSyncEl.textContent = formatTimestamp(lastSyncLog.timestamp);
  }
}

// Sync printers
async function syncPrinters() {
  try {
    syncBtn.disabled = true;
    syncBtn.textContent = '⏳ Syncing...';

    const result = await ipcRenderer.invoke('sync-printers');

    if (result.success) {
      await loadPrinters();
      await loadLogs();
    } else {
      alert('Failed to sync printers: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Sync error:', error);
    alert('Failed to sync printers');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = '🔄 Sync Now';
  }
}

// Event listeners
syncBtn.addEventListener('click', syncPrinters);
refreshLogsBtn.addEventListener('click', loadLogs);

// Utility functions
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
initialize();

