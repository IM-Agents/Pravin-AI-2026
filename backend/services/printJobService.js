const { OrderDepartmentStatus } = require('../models');
const PrinterService = require('./printerService');
const TimelineService = require('./timelineService');

class PrintJobService {
  static async createPrintJob(orderId, department, pdfPath) {
    try {
      await this.updateDepartmentStatus(orderId, department, 'In-Progress');
      await TimelineService.addEvent(orderId, TimelineService.EVENTS.PRINT_VALIDATION_STARTED, \`Validating printer for \${department} department\`, { department, status: 'In-Progress' });
      const validation = await PrinterService.validatePrinterForDepartment(department);
      if (!validation.valid) {
        await this.updateDepartmentStatus(orderId, department, 'Failure');
        await TimelineService.addEvent(orderId, TimelineService.EVENTS.PRINTER_VALIDATION_FAILED, validation.reason, { department, status: 'Failure' });
        return { success: false, reason: validation.reason };
      }
      await TimelineService.addEvent(orderId, TimelineService.EVENTS.PRINTER_VALIDATED, \`Printer \${validation.printer.printer_name} validated for \${department}\`, { department, status: 'In-Progress' });
      const printJob = { order_id: orderId, department, printer_id: validation.printer.printer_id, pdf_path: pdfPath, timestamp: new Date().toISOString() };
      await this.sendToElectron(printJob);
      await TimelineService.addEvent(orderId, TimelineService.EVENTS.PRINT_JOB_SENT, \`Print job sent to \${validation.printer.printer_name}\`, { department, status: 'In-Progress', metadata: printJob });
      return { success: true, printJob };
    } catch (error) {
      console.error(\`❌ Error creating print job for \${department}:\`, error);
      await this.updateDepartmentStatus(orderId, department, 'Failure');
      await TimelineService.addEvent(orderId, TimelineService.EVENTS.PRINT_FAILED, \`Print job failed: \${error.message}\`, { department, status: 'Failure' });
      throw error;
    }
  }

  static async updateDepartmentStatus(orderId, department, status) {
    try {
      const departmentStatus = await OrderDepartmentStatus.findOne({ where: { order_id: orderId } });
      if (!departmentStatus) throw new Error(\`Department status not found for order \${orderId}\`);
      const statusField = \`\${department.toLowerCase()}_status\`;
      await departmentStatus.update({ [statusField]: status });
      console.log(\`✅ Updated \${department} status to \${status} for order \${orderId}\`);
    } catch (error) {
      console.error('❌ Error updating department status:', error);
      throw error;
    }
  }

  static async sendToElectron(printJob) {
    console.log('📤 Print job ready for Electron:', printJob);
  }

  static async handlePrintResult(orderId, department, success, message) {
    try {
      const newStatus = success ? 'Success' : 'Failure';
      await this.updateDepartmentStatus(orderId, department, newStatus);
      const eventType = success ? TimelineService.EVENTS.PRINT_COMPLETED : TimelineService.EVENTS.PRINT_FAILED;
      await TimelineService.addEvent(orderId, eventType, message, { department, status: newStatus });
      console.log(\`✅ Print result recorded for \${department}: \${newStatus}\`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error handling print result:', error);
      throw error;
    }
  }
}

module.exports = PrintJobService;
