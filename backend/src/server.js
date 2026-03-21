const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { testConnection } = require('./config/db');
const { initSocket } = require('./config/socket');
const { setupSocketHandlers } = require('./socket/socketHandler');

const server = http.createServer(app);

const io = initSocket(server);
setupSocketHandlers(io);

async function startServer() {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.warn('Warning: Database connection failed. Some features may not work.');
  }
  
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`WebSocket CORS origin: ${config.socket.corsOrigin}`);
  });
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
