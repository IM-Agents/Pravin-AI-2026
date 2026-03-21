const { handlePrintResult } = require('../services/printService');
const Printer = require('../models/Printer');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('join_electron', (data) => {
      socket.join('electron');
      console.log(`Electron client joined: ${socket.id}`, data);
    });
    
    socket.on('join_frontend', () => {
      socket.join('frontend');
      console.log(`Frontend client joined: ${socket.id}`);
    });
    
    socket.on('printer_sync', async (data) => {
      try {
        const { machine_id, printers } = data;
        
        if (!machine_id || !Array.isArray(printers)) {
          console.error('Invalid printer_sync data:', data);
          return;
        }
        
        const result = await Printer.syncPrinters(machine_id, printers);
        console.log(`Printers synced from ${machine_id}:`, result);
        
        const allPrinters = await Printer.findAll();
        io.emit('printers_updated', { printers: allPrinters });
      } catch (error) {
        console.error('Error handling printer_sync:', error);
      }
    });
    
    socket.on('printer_status', async (data) => {
      try {
        const { machine_id, printer_name, status } = data;
        
        if (!machine_id || !printer_name || !status) {
          console.error('Invalid printer_status data:', data);
          return;
        }
        
        await Printer.updateStatus(printer_name, machine_id, status);
        console.log(`Printer status updated: ${printer_name} -> ${status}`);
        
        const allPrinters = await Printer.findAll();
        io.emit('printers_updated', { printers: allPrinters });
      } catch (error) {
        console.error('Error handling printer_status:', error);
      }
    });
    
    socket.on('print_status_update', async (data) => {
      try {
        const { job_id, status, message, timestamp } = data;
        
        if (!job_id || !status) {
          console.error('Invalid print_status_update data:', data);
          return;
        }
        
        await handlePrintResult(job_id, status, message);
        console.log(`Print job ${job_id} completed with status: ${status}`);
      } catch (error) {
        console.error('Error handling print_status_update:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocketHandlers };
