const express = require('express');
const router = express.Router();
const { verifyShopifyWebhook } = require('../middleware/shopifyAuth');
const webhookController = require('../controllers/webhookController');

router.post('/shopify/orders/create', verifyShopifyWebhook, webhookController.handleOrderCreated);
router.post('/shopify/orders/cancelled', verifyShopifyWebhook, webhookController.handleOrderCancelled);

module.exports = router;
