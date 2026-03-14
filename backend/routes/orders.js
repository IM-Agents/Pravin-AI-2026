const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

router.get('/action-required', OrderController.getActionRequiredOrders);
router.get('/', OrderController.getAllOrders);
router.get('/:orderId/timeline', OrderController.getOrderTimeline);
router.get('/:orderId/department/:department/download-pdf', OrderController.downloadDepartmentPDF);
router.post('/:orderId/ignore', OrderController.toggleIgnoreOrder);

module.exports = router;
