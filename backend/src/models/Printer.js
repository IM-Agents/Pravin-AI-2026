const { pool } = require('../config/db');

const Printer = {
  async upsert(printerData) {
    const sql = `
      INSERT INTO printers (printer_name, machine_id, status, is_active, assigned_department)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const [result] = await pool.execute(sql, [
      printerData.printer_name,
      printerData.machine_id,
      printerData.status || 'offline',
      printerData.is_active !== undefined ? printerData.is_active : true,
      printerData.assigned_department || null
    ]);
    
    return result.insertId || result.affectedRows;
  },
  
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM printers ORDER BY printer_name'
    );
    return rows;
  },
  
  async findById(printerId) {
    const [rows] = await pool.execute(
      'SELECT * FROM printers WHERE printer_id = ?',
      [printerId]
    );
    return rows[0] || null;
  },
  
  async findByDepartment(department) {
    const [rows] = await pool.execute(
      `SELECT * FROM printers 
       WHERE assigned_department = ? AND is_active = TRUE AND status = 'online'
       LIMIT 1`,
      [department]
    );
    return rows[0] || null;
  },
  
  async findByNameAndMachine(printerName, machineId) {
    const [rows] = await pool.execute(
      'SELECT * FROM printers WHERE printer_name = ? AND machine_id = ?',
      [printerName, machineId]
    );
    return rows[0] || null;
  },
  
  async updateStatus(printerName, machineId, status) {
    await pool.execute(
      `UPDATE printers SET status = ? WHERE printer_name = ? AND machine_id = ?`,
      [status, printerName, machineId]
    );
  },
  
  async assignDepartment(printerId, department) {
    if (department) {
      await pool.execute(
        `UPDATE printers SET assigned_department = NULL WHERE assigned_department = ?`,
        [department]
      );
    }
    
    await pool.execute(
      `UPDATE printers SET assigned_department = ? WHERE printer_id = ?`,
      [department, printerId]
    );
  },
  
  async toggleActive(printerId, isActive) {
    await pool.execute(
      `UPDATE printers SET is_active = ? WHERE printer_id = ?`,
      [isActive, printerId]
    );
  },
  
  async syncPrinters(machineId, printers) {
    let newCount = 0;
    let updatedCount = 0;
    
    for (const printer of printers) {
      const existing = await this.findByNameAndMachine(printer.printer_name, machineId);
      
      if (existing) {
        await this.updateStatus(printer.printer_name, machineId, printer.status);
        updatedCount++;
      } else {
        await this.upsert({
          printer_name: printer.printer_name,
          machine_id: machineId,
          status: printer.status,
          is_active: true,
          assigned_department: null
        });
        newCount++;
      }
    }
    
    return { synced: printers.length, new: newCount, updated: updatedCount };
  }
};

module.exports = Printer;
