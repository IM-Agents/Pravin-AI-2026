const express = require('express');
const router = express.Router();

const webhookRoutes = require('./webhookRoutes');
const orderRoutes = require('./orderRoutes');
const printerRoutes = require('./printerRoutes');

router.use('/webhooks', webhookRoutes);
router.use('/orders', orderRoutes);
router.use('/printers', printerRoutes);

module.exports = router;
