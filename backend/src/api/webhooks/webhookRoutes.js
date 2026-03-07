const express = require('express');
const router = express.Router();
const webhookController = require('./webhookController');
const { validateShopifyHMAC } = require('../../utils/hmacValidator');
const logger = require('../../utils/logger');

router.use((req, res, next) => {
  const rawBody = req.body;
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    logger.warn('SHOPIFY_WEBHOOK_SECRET not configured, skipping HMAC validation');
    req.body = JSON.parse(rawBody.toString());
    return next();
  }

  if (!hmacHeader) {
    logger.warn('Missing HMAC header in webhook request');
    return res.status(401).json({ error: 'Missing HMAC header' });
  }

  const isValid = validateShopifyHMAC(rawBody, hmacHeader, secret);

  if (!isValid) {
    logger.error('Invalid HMAC signature');
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  req.body = JSON.parse(rawBody.toString());
  next();
});

router.post('/shopify/orders/create', webhookController.handleOrderCreate);

module.exports = router;