const crypto = require('crypto');

const verifyShopifyWebhook = (req, res, next) => {
  try {
    const hmacHeader = req.get('X-Shopify-Hmac-SHA256');
    if (!hmacHeader) return res.status(401).json({ error: 'Missing HMAC signature' });
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('❌ SHOPIFY_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
    if (hash !== hmacHeader) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    console.log('✅ Shopify webhook signature verified');
    next();
  } catch (error) {
    console.error('❌ Error verifying webhook:', error);
    return res.status(500).json({ error: 'Webhook verification failed' });
  }
};

module.exports = { verifyShopifyWebhook };
