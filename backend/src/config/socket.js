const { Server } = require('socket.io');
const config = require('./env');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.socket.corsOrigin,
      methods: ['GET', 'POST']
    }
  });
  
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = { initSocket, getIO };
