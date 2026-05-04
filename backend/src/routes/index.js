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

// Smoke-only: string concat instead of numeric add (wrong for "1"+"2" expectation).
router.get('/cr-smoke-sum', (req, res) => {
  const a = req.query.a;
  const b = req.query.b;
  res.json({ sum: a + b });
});

router.use('/webhooks', webhookRoutes);
router.use('/orders', orderRoutes);
router.use('/printers', printerRoutes);
router.use('/users', userRoutes);

module.exports = router;
