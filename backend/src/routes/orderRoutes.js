const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const printJobController = require('../controllers/printJobController');

router.get('/action-required', orderController.getActionRequired);
router.get('/', orderController.getAllOrders);
router.get('/:order_id', orderController.getOrderDetail);
router.patch('/:order_id/ignore', orderController.updateIgnoreStatus);
router.get('/:order_id/timeline', orderController.getOrderTimeline);

router.post('/:order_id/departments/:department/print', printJobController.triggerDepartmentPrint);
router.post('/:order_id/departments/:department/retry', printJobController.retryDepartmentPrint);
router.get('/:order_id/departments/:department/download-pdf', printJobController.downloadDepartmentPdf);

module.exports = router;
