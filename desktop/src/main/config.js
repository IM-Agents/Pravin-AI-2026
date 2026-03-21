const os = require('os');

module.exports = {
  backendUrl: process.env.OMA_BACKEND_URL || 'http://localhost:8000',
  printerCheckInterval: 30000,
  reconnectInterval: 5000,
  maxReconnectAttempts: Infinity,
  machineId: os.hostname()
};
