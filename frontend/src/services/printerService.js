import api from './api';

class PrinterService {
  /**
   * Get all printers
   */
  static async getAllPrinters() {
    try {
      const response = await api.get('/api/printers');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign printer to department
   */
  static async assignPrinter(printerId, department) {
    try {
      const response = await api.post('/api/printers/assign', {
        printer_id: printerId,
        department: department,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle printer active status
   */
  static async togglePrinterActive(printerId, isActive) {
    try {
      const response = await api.post('/api/printers/toggle-active', {
        printer_id: printerId,
        is_active: isActive,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default PrinterService;

