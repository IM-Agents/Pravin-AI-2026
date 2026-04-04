const { pool } = require('../config/db');

async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, age, created_at FROM users ORDER BY id ASC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
}

module.exports = {
  getAllUsers
};
