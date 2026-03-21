const { pool } = require('../config/db');

const PrintJob = {
  async create(jobData) {
    const sql = `
      INSERT INTO print_jobs (
        job_id, order_id, department, printer_id, template_type, status, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      jobData.job_id,
      jobData.order_id,
      jobData.department,
      jobData.printer_id || null,
      jobData.template_type || 'standard',
      jobData.status || 'QUEUED',
      jobData.error_message || null
    ]);
    
    return result.insertId;
  },
  
  async findByJobId(jobId) {
    const [rows] = await pool.execute(
      'SELECT * FROM print_jobs WHERE job_id = ?',
      [jobId]
    );
    return rows[0] || null;
  },
  
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM print_jobs WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return rows;
  },
  
  async updateStatus(jobId, status, errorMessage = null) {
    await pool.execute(
      `UPDATE print_jobs SET status = ?, error_message = ? WHERE job_id = ?`,
      [status, errorMessage, jobId]
    );
  },
  
  async cancelPendingJobs(orderId) {
    const [result] = await pool.execute(
      `UPDATE print_jobs 
       SET status = 'CANCELLED' 
       WHERE order_id = ? AND status IN ('QUEUED', 'IN-PROGRESS')`,
      [orderId]
    );
    return result.affectedRows;
  },
  
  async findPendingByOrderAndDepartment(orderId, department) {
    const [rows] = await pool.execute(
      `SELECT * FROM print_jobs 
       WHERE order_id = ? AND department = ? AND status IN ('QUEUED', 'IN-PROGRESS')
       ORDER BY created_at DESC LIMIT 1`,
      [orderId, department]
    );
    return rows[0] || null;
  }
};

module.exports = PrintJob;
