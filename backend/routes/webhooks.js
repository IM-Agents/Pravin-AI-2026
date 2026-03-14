const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');
const { verifyShopifyWebhook } = require('../middleware/shopifyAuth');

router.post('/shopify/orders/create', verifyShopifyWebhook, WebhookController.handleOrderCreated);
router.post('/shopify/*', verifyShopifyWebhook, WebhookController.handleOtherWebhook);

module.exports = router;
