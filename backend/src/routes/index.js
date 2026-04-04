const express = require('express');
const router = express.Router();

const webhookRoutes = require('./webhookRoutes');
const orderRoutes = require('./orderRoutes');
const printerRoutes = require('./printerRoutes');
const userRoutes = require('./userRoutes');

router.use('/webhooks', webhookRoutes);
router.use('/orders', orderRoutes);
router.use('/printers', printerRoutes);
router.use('/users', userRoutes);

module.exports = router;
