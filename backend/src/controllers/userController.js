const userStorage = require('../models/UserStorage');

/**
 * Get all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userStorage.getAllUsers();
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers
};

