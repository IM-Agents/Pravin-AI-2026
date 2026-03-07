const orderAutomationService = require('../../services/orderAutomationService');
const logger = require('../../utils/logger');

exports.handleOrderCreate = async (req, res) => {
  try {
    const orderData = req.body;

    logger.info(`Received order webhook for Shopify order ${orderData.id}`);

    const result = await orderAutomationService.processOrder(orderData);

    res.status(200).json({
      success: true,
      message: 'Order processed successfully',
      order_id: result.order.order_id,
      shopify_order_id: result.order.shopify_order_id,
      rule_matched: result.ruleResult.ruleName,
      printed: result.printed
    });
  } catch (error) {
    logger.error('Error handling order webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};