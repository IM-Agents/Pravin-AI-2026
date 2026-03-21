const { pool } = require('../config/db');

const OrderTimeline = {
  async create(eventData) {
    const sql = `
      INSERT INTO order_timeline (order_id, event_type, department, status, message)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      eventData.order_id,
      eventData.event_type,
      eventData.department || null,
      eventData.status || null,
      eventData.message
    ]);
    
    return result.insertId;
  },
  
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM order_timeline WHERE order_id = ? ORDER BY timestamp ASC',
      [orderId]
    );
    return rows;
  },
  
  async getLatestEvent(orderId, eventType) {
    const [rows] = await pool.execute(
      `SELECT * FROM order_timeline 
       WHERE order_id = ? AND event_type = ?
       ORDER BY timestamp DESC LIMIT 1`,
      [orderId, eventType]
    );
    return rows[0] || null;
  }
};

module.exports = OrderTimeline;
