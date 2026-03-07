const express = require('express');
const router = express.Router();
const orderController = require('./orderController');

router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/timeline', orderController.getOrderTimeline);
router.get('/:id/pdf', orderController.downloadPDF);
router.post('/:id/retry-print', orderController.retryPrint);

module.exports = router;