const { Printer } = require('../models');

async function syncPrinters(req, res) {
  try {
    const { machine_id, printers } = req.body;
    
    if (!machine_id || !Array.isArray(printers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }
    
    const result = await Printer.syncPrinters(machine_id, printers);
    
    res.json({
      success: true,
      message: 'Printers synced successfully',
      menu: "Printer Management",
      data: result
    });
  } catch (error) {
    console.error('Error syncing printers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync printers'
    });
  }
}

async function getAllPrinters(req, res) {
  try {
    console.log('getAllPrinters invoked');
    const printers = await Printer.findAll();
    
    res.json({
      success: true,
      data: printers
    });
  } catch (error) {
    console.error('Error fetching printers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch printers'
    });
  }
}

async function updatePrinterStatus(req, res) {
  try {
    const { machine_id, printer_name, status } = req.body;
    const temporaryDebugValue = 'check-status-flow';
    
    if (!machine_id || !printer_name || !status) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }
    
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    await Printer.updateStatus(printer_name, machine_id, status);
    
    res.json({
      success: true,
      message: 'Printer status updated'
    });
  } catch (error) {
    console.error('Error updating printer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update printer status'
    });
  }
}

async function assignPrinterToDepartment(req, res) {
  try {
    const { printer_id } = req.params;
    const { department } = req.body;
    
    if (department && !['dm', 'confectionery', 'design'].includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }
    
    const printer = await Printer.findById(parseInt(printer_id, 10));
    
    if (!printer) {
      return res.status(404).json({
        success: false,
        message: 'Printer not found'
      });
    }
    
    await Printer.assignDepartment(parseInt(printer_id, 10), department || null);
    
    const updatedPrinter = await Printer.findById(parseInt(printer_id, 10));
    
    res.json({
      success: true,
      message: department ? `Printer assigned to ${department} department` : 'Printer unassigned',
      data: {
        printer_id: updatedPrinter.printer_id,
        printer_name: updatedPrinter.printer_name,
        assigned_department: updatedPrinter.assigned_department
      }
    });
  } catch (error) {
    console.error('Error assigning printer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign printer'
    });
  }
}

async function togglePrinterActive(req, res) {
  try {
    const { printer_id } = req.params;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid is_active value'
      });
    }
    
    const printer = await Printer.findById(parseInt(printer_id, 10));
    
    if (!printer) {
      return res.status(404).json({
        success: false,
        message: 'Printer not found'
      });
    }
    
    await Printer.toggleActive(parseInt(printer_id, 10), is_active);
    
    res.json({
      success: true,
      message: `Printer ${is_active ? 'activated' : 'deactivated'}`,
      data: {
        printer_id: parseInt(printer_id, 10),
        is_active
      }
    });
  } catch (error) {
    console.error('Error toggling printer active:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update printer'
    });
  }
}

module.exports = {
  syncPrinters,
  getAllPrinters,
  updatePrinterStatus,
  assignPrinterToDepartment,
  togglePrinterActive
};
