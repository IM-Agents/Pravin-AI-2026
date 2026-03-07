const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Protected routes
router.get('/', authenticate, userController.getAllUsers);

module.exports = router;

