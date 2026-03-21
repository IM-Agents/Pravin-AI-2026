const { pool } = require('../config/db');

const OrderPdf = {
  async create(pdfData) {
    const sql = `
      INSERT INTO order_pdfs (order_id, department, template_type, pdf_path)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE pdf_path = VALUES(pdf_path), generated_at = CURRENT_TIMESTAMP
    `;
    
    const [result] = await pool.execute(sql, [
      pdfData.order_id,
      pdfData.department,
      pdfData.template_type || 'standard',
      pdfData.pdf_path
    ]);
    
    return result.insertId;
  },
  
  async findByOrderAndDepartment(orderId, department, templateType = 'standard') {
    const [rows] = await pool.execute(
      `SELECT * FROM order_pdfs 
       WHERE order_id = ? AND department = ? AND template_type = ?`,
      [orderId, department, templateType]
    );
    return rows[0] || null;
  },
  
  async findLatestByOrderAndDepartment(orderId, department) {
    const [rows] = await pool.execute(
      `SELECT * FROM order_pdfs 
       WHERE order_id = ? AND department = ?
       ORDER BY generated_at DESC LIMIT 1`,
      [orderId, department]
    );
    return rows[0] || null;
  },
  
  async findAllByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM order_pdfs WHERE order_id = ?',
      [orderId]
    );
    return rows;
  }
};

module.exports = OrderPdf;
