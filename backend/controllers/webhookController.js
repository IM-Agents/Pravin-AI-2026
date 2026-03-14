const OrderService = require('../services/orderService');

class WebhookController {
  static async handleOrderCreated(req, res) {
    try {
      console.log('📥 Received Shopify order webhook');
      const shopifyOrder = req.body;
      const order = await OrderService.processShopifyOrder(shopifyOrder);
      res.status(200).json({ success: true, message: 'Order processed successfully', order_id: order.id, order_number: order.order_number });
    } catch (error) {
      console.error('❌ Error handling order webhook:', error);
      res.status(200).json({ success: false, error: error.message });
    }
  }

  static async handleOtherWebhook(req, res) {
    console.log('📥 Received other Shopify webhook:', req.get('X-Shopify-Topic'));
    res.status(200).json({ success: true, message: 'Webhook received' });
  }
}

module.exports = WebhookController;
