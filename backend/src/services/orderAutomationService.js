const { Order, OrderProduct } = require('../models');
const ruleEngine = require('../rules/ruleEngine');
const pdfService = require('./pdfService');
const printQueueService = require('./printQueueService');
const timelineService = require('./timelineService');
const logger = require('../utils/logger');

class OrderAutomationService {
  async processOrder(orderData) {
    let order = null;

    try {
      logger.info(`Starting order automation for Shopify order ${orderData.id}`);

      order = await this.storeOrder(orderData);

      await timelineService.logWebhookReceived(order);

      await order.update({ webhook_received_at: new Date() });

      const orderWithProducts = await Order.findByPk(order.order_id, {
        include: [{ model: OrderProduct, as: 'products' }]
      });

      const ruleResult = await ruleEngine.evaluate(orderWithProducts);

      await order.update({
        dm_status: ruleResult.statuses.dm,
        confectionery_status: ruleResult.statuses.confectionery,
        design_status: ruleResult.statuses.design,
        rule_evaluated_at: new Date()
      });

      await timelineService.logRuleEvaluation(order, ruleResult);

      if (ruleResult.shouldPrint) {
        await this.generateAndPrint(order, ruleResult);
      } else {
        logger.info(`Order ${order.shopify_order_id} does not require printing (status: PENDING)`);
      }

      logger.info(`Order automation completed for order ${order.shopify_order_id}`);

      return {
        success: true,
        order,
        ruleResult,
        printed: ruleResult.shouldPrint
      };
    } catch (error) {
      logger.error(`Error in order automation for order ${orderData.id}:`, error);

      if (order) {
        await timelineService.logEvent({
          store_client_id: order.store_client_id,
          order_id: order.order_id,
          tabs: '5',
          tab_details: 'Order automation failed',
          event_type: 'AUTOMATION_ERROR',
          department: 'ALL',
          status: 'FAILURE',
          error_message: error.message
        });
      }

      throw error;
    }
  }

  async storeOrder(shopifyOrder) {
    try {
      const orderData = {
        store_client_id: shopifyOrder.store_client_id || 1,
        customer_id: shopifyOrder.customer?.id || null,
        first_name: shopifyOrder.customer?.first_name || shopifyOrder.shipping_address?.first_name,
        last_name: shopifyOrder.customer?.last_name || shopifyOrder.shipping_address?.last_name,
        email: shopifyOrder.email || shopifyOrder.customer?.email,
        shipping_address: this.formatAddress(shopifyOrder.shipping_address),
        shipping_street: shopifyOrder.shipping_address?.address1,
        shipping_city: shopifyOrder.shipping_address?.city,
        shipping_province: shopifyOrder.shipping_address?.province,
        shipping_zip: shopifyOrder.shipping_address?.zip,
        shipping_phone: shopifyOrder.shipping_address?.phone || shopifyOrder.customer?.phone,
        company_name: shopifyOrder.shipping_address?.company,
        order_number: shopifyOrder.order_number,
        order_name: shopifyOrder.name,
        total: parseFloat(shopifyOrder.total_price || 0),
        shopify_order_id: shopifyOrder.id,
        order_status: shopifyOrder.financial_status === 'paid' ? '1' : '0',
        delivery_date: shopifyOrder.note_attributes?.find(attr => attr.name === 'delivery_date')?.value || null,
        delivery_time: shopifyOrder.note_attributes?.find(attr => attr.name === 'delivery_time')?.value || null,
        notes: shopifyOrder.note
      };

      const [order, created] = await Order.upsert(orderData, {
        returning: true
      });

      logger.info(`Order ${created ? 'created' : 'updated'}: ${order.shopify_order_id}`);

      if (shopifyOrder.line_items && shopifyOrder.line_items.length > 0) {
        await this.storeOrderProducts(order, shopifyOrder.line_items);
      }

      return order;
    } catch (error) {
      logger.error('Error storing order:', error);
      throw error;
    }
  }

  async storeOrderProducts(order, lineItems) {
    try {
      for (const item of lineItems) {
        await OrderProduct.upsert({
          store_client_id: order.store_client_id,
          shopify_order_id: order.shopify_order_id,
          product_id: item.product_id,
          line_item_id: item.id,
          variant_id: item.variant_id,
          product_sku: item.sku,
          product_name: item.name || item.title,
          product_qty: item.quantity,
          qty: item.quantity,
          tag: item.properties?.find(p => p.name === 'tag')?.value || '',
          product_info: JSON.stringify(item)
        });
      }

      logger.info(`Stored ${lineItems.length} products for order ${order.shopify_order_id}`);
    } catch (error) {
      logger.error('Error storing order products:', error);
      throw error;
    }
  }

  async generateAndPrint(order, ruleResult) {
    try {
      const pdfPath = await pdfService.generateOrderPDF(order);

      await order.update({
        pdf_path: pdfPath,
        pdf_generated_at: new Date()
      });

      await timelineService.logPDFGeneration(order, true);

      const departmentsToPrint = ruleEngine.getDepartmentsToPrint(ruleResult.statuses);

      if (departmentsToPrint.length > 0) {
        await printQueueService.addPrintJobs(
          order.order_id,
          pdfPath,
          departmentsToPrint,
          order.store_client_id
        );

        logger.info(`Print jobs queued for departments: ${departmentsToPrint.join(', ')}`);
      }
    } catch (error) {
      logger.error(`Error generating PDF and queueing print jobs:`, error);
      await timelineService.logPDFGeneration(order, false, error.message);
      throw error;
    }
  }

  formatAddress(address) {
    if (!address) return null;

    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.zip,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  async retryPrintJob(orderId, department) {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (!order.pdf_path) {
        throw new Error(`No PDF found for order ${orderId}`);
      }

      await printQueueService.addPrintJob(
        order.order_id,
        order.pdf_path,
        department,
        order.store_client_id
      );

      const statusField = `${department.toLowerCase()}_status`;
      await order.update({ [statusField]: 'IN-PROGRESS' });

      logger.info(`Retry print job queued for order ${orderId}, department: ${department}`);

      return { success: true, message: 'Print job queued successfully' };
    } catch (error) {
      logger.error(`Error retrying print job:`, error);
      throw error;
    }
  }
}

module.exports = new OrderAutomationService();