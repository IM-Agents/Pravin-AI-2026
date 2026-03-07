const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Settings endpoint - to be implemented' });
});

module.exports = router;