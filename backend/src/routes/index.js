const express = require('express');
const router = express.Router();

const webhookRoutes = require('./webhookRoutes');
const orderRoutes = require('./orderRoutes');
const printerRoutes = require('./printerRoutes');
const userRoutes = require('./userRoutes');

// Simple test route to verify API routing.
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test route is working' });
});

router.use('/webhooks', webhookRoutes);
router.use('/orders', orderRoutes);
router.use('/printers', printerRoutes);
router.use('/users', userRoutes);

module.exports = router;
