const crypto = require('crypto');
const config = require('../config/env');

function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!hmacHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Missing webhook signature' 
    });
  }
  
  if (!config.shopify.webhookSecret) {
    console.warn('SHOPIFY_WEBHOOK_SECRET not configured, skipping validation');
    return next();
  }
  
  const body = req.rawBody;
  
  if (!body) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing request body' 
    });
  }
  
  const hash = crypto
    .createHmac('sha256', config.shopify.webhookSecret)
    .update(body, 'utf8')
    .digest('base64');
  
  if (hash === hmacHeader) {
    next();
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid webhook signature' 
    });
  }
}

module.exports = { verifyShopifyWebhook };
