const { pool } = require('../config/db');

const OrderDepartmentStatus = {
  async create(orderId, statuses) {
    const sql = `
      INSERT INTO order_department_status (
        order_id, dm_status, confectionery_status, design_status
      ) VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      orderId,
      statuses.dm || 'PENDING',
      statuses.confectionery || 'PENDING',
      statuses.design || 'PENDING'
    ]);
    
    return result.insertId;
  },
  
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM order_department_status WHERE order_id = ?',
      [orderId]
    );
    return rows[0] || null;
  },
  
  async updateStatus(orderId, department, status) {
    const column = `${department}_status`;
    const validColumns = ['dm_status', 'confectionery_status', 'design_status'];
    
    if (!validColumns.includes(column)) {
      throw new Error(`Invalid department: ${department}`);
    }
    
    await pool.execute(
      `UPDATE order_department_status SET ${column} = ? WHERE order_id = ?`,
      [status, orderId]
    );
  },
  
  async getStatus(orderId, department) {
    const column = `${department}_status`;
    const [rows] = await pool.execute(
      `SELECT ${column} as status FROM order_department_status WHERE order_id = ?`,
      [orderId]
    );
    return rows[0]?.status || null;
  }
};

module.exports = OrderDepartmentStatus;
