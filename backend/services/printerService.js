const { Printer } = require('../models');

class PrinterService {
  static async syncPrinters(machineId, printers) {
    try {
      for (const printerData of printers) {
        const { printer_id, printer_name, status } = printerData;
        const existingPrinter = await Printer.findOne({ where: { printer_id } });
        if (existingPrinter) {
          await existingPrinter.update({ printer_name, machine_id: machineId, status });
          console.log(\`✅ Updated printer: \${printer_name}\`);
        } else {
          await Printer.create({ printer_id, printer_name, machine_id: machineId, status, is_active: false });
          console.log(\`✅ Created new printer: \${printer_name}\`);
        }
      }
      return { success: true, message: 'Printers synced successfully' };
    } catch (error) {
      console.error('❌ Error syncing printers:', error);
      throw error;
    }
  }

  static async updatePrinterStatus(printerId, status) {
    try {
      const printer = await Printer.findOne({ where: { printer_id: printerId } });
      if (!printer) throw new Error(\`Printer not found: \${printerId}\`);
      await printer.update({ status });
      console.log(\`✅ Printer status updated: \${printerId} -> \${status}\`);
      return { success: true, message: 'Printer status updated' };
    } catch (error) {
      console.error('❌ Error updating printer status:', error);
      throw error;
    }
  }

  static async getAllPrinters() {
    try {
      return await Printer.findAll({ order: [['created_at', 'DESC']] });
    } catch (error) {
      console.error('❌ Error fetching printers:', error);
      throw error;
    }
  }

  static async assignPrinterToDepartment(printerId, department) {
    try {
      const printer = await Printer.findByPk(printerId);
      if (!printer) throw new Error(\`Printer not found with ID: \${printerId}\`);
      const existingAssignment = await Printer.findOne({ where: { assigned_department: department } });
      if (existingAssignment && existingAssignment.id !== printerId) {
        await existingAssignment.update({ assigned_department: null });
      }
      await printer.update({ assigned_department: department });
      console.log(\`✅ Printer \${printer.printer_name} assigned to \${department}\`);
      return { success: true, message: 'Printer assigned successfully' };
    } catch (error) {
      console.error('❌ Error assigning printer:', error);
      throw error;
    }
  }

  static async togglePrinterActive(printerId, isActive) {
    try {
      const printer = await Printer.findByPk(printerId);
      if (!printer) throw new Error(\`Printer not found with ID: \${printerId}\`);
      await printer.update({ is_active: isActive });
      console.log(\`✅ Printer \${printer.printer_name} \${isActive ? 'activated' : 'deactivated'}\`);
      return { success: true, message: \`Printer \${isActive ? 'activated' : 'deactivated'}\` };
    } catch (error) {
      console.error('❌ Error toggling printer status:', error);
      throw error;
    }
  }

  static async validatePrinterForDepartment(department) {
    try {
      const printer = await Printer.findOne({ where: { assigned_department: department } });
      if (!printer) return { valid: false, reason: \`No printer assigned to \${department} department\` };
      if (!printer.is_active) return { valid: false, reason: \`Printer \${printer.printer_name} is not activated\` };
      if (printer.status !== 'online') return { valid: false, reason: \`Printer \${printer.printer_name} is offline\` };
      return { valid: true, printer };
    } catch (error) {
      console.error('❌ Error validating printer:', error);
      throw error;
    }
  }
}

module.exports = PrinterService;
