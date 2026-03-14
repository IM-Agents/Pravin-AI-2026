const PrinterService = require('../services/printerService');

class PrinterController {
  static async syncPrinters(req, res) {
    try {
      const { machine_id, printers } = req.body;
      if (!machine_id || !printers || !Array.isArray(printers)) {
        return res.status(400).json({ success: false, error: 'Invalid request body. Required: machine_id, printers (array)' });
      }
      const result = await PrinterService.syncPrinters(machine_id, printers);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error syncing printers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updatePrinterStatus(req, res) {
    try {
      const { printer_id, status } = req.body;
      if (!printer_id || !status) {
        return res.status(400).json({ success: false, error: 'Invalid request body. Required: printer_id, status' });
      }
      if (!['online', 'offline'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be "online" or "offline"' });
      }
      const result = await PrinterService.updatePrinterStatus(printer_id, status);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error updating printer status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllPrinters(req, res) {
    try {
      const printers = await PrinterService.getAllPrinters();
      res.status(200).json({ success: true, count: printers.length, printers });
    } catch (error) {
      console.error('❌ Error fetching printers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async assignPrinter(req, res) {
    try {
      const { printer_id, department } = req.body;
      if (!printer_id || !department) {
        return res.status(400).json({ success: false, error: 'Invalid request body. Required: printer_id, department' });
      }
      const validDepartments = ['DM', 'Confectionery', 'Design'];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({ success: false, error: 'Invalid department. Must be one of: DM, Confectionery, Design' });
      }
      const result = await PrinterService.assignPrinterToDepartment(printer_id, department);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error assigning printer:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async togglePrinterActive(req, res) {
    try {
      const { printer_id, is_active } = req.body;
      if (!printer_id || typeof is_active !== 'boolean') {
        return res.status(400).json({ success: false, error: 'Invalid request body. Required: printer_id, is_active (boolean)' });
      }
      const result = await PrinterService.togglePrinterActive(printer_id, is_active);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error toggling printer status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = PrinterController;
