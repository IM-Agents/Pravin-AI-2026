const { Order, OrderDepartmentStatus, OrderPDF } = require('../models');
const RulesEngine = require('./rulesEngine');
const PDFService = require('./pdfService');
const PrintJobService = require('./printJobService');
const TimelineService = require('./timelineService');

class OrderService {
  static async processShopifyOrder(shopifyOrder) {
    try {
      const orderData = this.extractOrderData(shopifyOrder);
      const existingOrder = await Order.findOne({ where: { order_id: orderData.order_id } });
      if (existingOrder) {
        console.log(\`⚠️ Order \${orderData.order_number} already exists\`);
        return existingOrder;
      }
      const order = await Order.create(orderData);
      console.log(\`✅ Order created: \${order.order_number}\`);
      await TimelineService.addEvent(order.id, TimelineService.EVENTS.ORDER_RECEIVED, \`Order received from Shopify\`, { department: 'System', status: 'Pending' });
      const departmentStatuses = RulesEngine.evaluateOrder(orderData);
      await OrderDepartmentStatus.create({ order_id: order.id, ...departmentStatuses });
      await TimelineService.addEvent(order.id, TimelineService.EVENTS.RULE_EVALUATED, \`Rule applied: \${departmentStatuses.rule_applied}\`, { department: 'System', status: 'Pending', metadata: departmentStatuses });
      await this.generateOrderPDFs(order, departmentStatuses);
      await this.triggerPrintJobs(order, departmentStatuses);
      return order;
    } catch (error) {
      console.error('❌ Error processing Shopify order:', error);
      throw error;
    }
  }

  static extractOrderData(shopifyOrder) {
    const deliveryDate = this.extractDeliveryDate(shopifyOrder);
    const deliveryTime = this.extractDeliveryTime(shopifyOrder);
    const productTags = [];
    if (shopifyOrder.line_items) {
      shopifyOrder.line_items.forEach(item => {
        if (item.product && item.product.tags) {
          productTags.push(...item.product.tags.split(',').map(t => t.trim()));
        }
      });
    }
    return {
      order_id: shopifyOrder.id.toString(),
      order_number: shopifyOrder.order_number || shopifyOrder.name,
      customer_name: shopifyOrder.customer ? \`\${shopifyOrder.customer.first_name || ''} \${shopifyOrder.customer.last_name || ''}\`.trim() : 'Guest',
      delivery_date: deliveryDate,
      delivery_time: deliveryTime,
      shipping_method: shopifyOrder.shipping_lines && shopifyOrder.shipping_lines[0] ? shopifyOrder.shipping_lines[0].title : null,
      order_items: shopifyOrder.line_items || [],
      product_tags: [...new Set(productTags)],
      order_type: shopifyOrder.source_name === 'draft_order' ? 'Draft' : 'Regular',
      raw_data: shopifyOrder
    };
  }

  static extractDeliveryDate(shopifyOrder) {
    if (shopifyOrder.note_attributes) {
      const attr = shopifyOrder.note_attributes.find(a => a.name.toLowerCase().includes('delivery') && a.name.toLowerCase().includes('date'));
      if (attr) return attr.value;
    }
    if (shopifyOrder.attributes) {
      const attr = shopifyOrder.attributes.find(a => a.name.toLowerCase().includes('delivery') && a.name.toLowerCase().includes('date'));
      if (attr) return attr.value;
    }
    return null;
  }

  static extractDeliveryTime(shopifyOrder) {
    if (shopifyOrder.note_attributes) {
      const attr = shopifyOrder.note_attributes.find(a => a.name.toLowerCase().includes('delivery') && a.name.toLowerCase().includes('time'));
      if (attr) return attr.value;
    }
    if (shopifyOrder.attributes) {
      const attr = shopifyOrder.attributes.find(a => a.name.toLowerCase().includes('delivery') && a.name.toLowerCase().includes('time'));
      if (attr) return attr.value;
    }
    return null;
  }

  static async generateOrderPDFs(order, departmentStatuses) {
    try {
      await TimelineService.addEvent(order.id, TimelineService.EVENTS.PDF_GENERATION_STARTED, 'Starting PDF generation for all departments', { department: 'System', status: 'In-Progress' });
      const pdfPaths = await PDFService.generateAllPDFs(order, departmentStatuses);
      await OrderPDF.create({ order_id: order.id, ...pdfPaths });
      await TimelineService.addEvent(order.id, TimelineService.EVENTS.PDF_GENERATED, 'PDFs generated successfully for all departments', { department: 'System', status: 'Success', metadata: pdfPaths });
      console.log(\`✅ PDFs generated for order \${order.order_number}\`);
    } catch (error) {
      await TimelineService.addEvent(order.id, TimelineService.EVENTS.PDF_GENERATION_FAILED, \`PDF generation failed: \${error.message}\`, { department: 'System', status: 'Failure' });
      throw error;
    }
  }

  static async triggerPrintJobs(order, departmentStatuses) {
    try {
      const orderPDF = await OrderPDF.findOne({ where: { order_id: order.id } });
      if (!orderPDF) throw new Error('Order PDFs not found');
      const printJobs = [];
      if (departmentStatuses.dm_status !== 'NA' && orderPDF.dm_pdf_path) {
        printJobs.push(PrintJobService.createPrintJob(order.id, 'DM', orderPDF.dm_pdf_path));
      }
      if (departmentStatuses.confectionery_status !== 'NA' && orderPDF.confectionery_pdf_path) {
        printJobs.push(PrintJobService.createPrintJob(order.id, 'Confectionery', orderPDF.confectionery_pdf_path));
      }
      if (departmentStatuses.design_status !== 'NA' && orderPDF.design_pdf_path) {
        printJobs.push(PrintJobService.createPrintJob(order.id, 'Design', orderPDF.design_pdf_path));
      }
      await Promise.all(printJobs);
      console.log(\`✅ Print jobs triggered for order \${order.order_number}\`);
    } catch (error) {
      console.error('❌ Error triggering print jobs:', error);
    }
  }

  static async getActionRequiredOrders(filters = {}) {
    try {
      const orders = await Order.findAll({
        where: { is_ignored: false },
        include: [
          { model: OrderDepartmentStatus, as: 'departmentStatus', required: true },
          { model: OrderPDF, as: 'pdfs' }
        ],
        order: [['created_at', 'DESC']]
      });
      return orders.filter(order => RulesEngine.requiresAction(order.departmentStatus));
    } catch (error) {
      console.error('❌ Error fetching action required orders:', error);
      throw error;
    }
  }

  static async getAllOrders() {
    try {
      return await Order.findAll({
        include: [
          { model: OrderDepartmentStatus, as: 'departmentStatus' },
          { model: OrderPDF, as: 'pdfs' }
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      console.error('❌ Error fetching all orders:', error);
      throw error;
    }
  }

  static async toggleIgnoreOrder(orderId, ignore) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) throw new Error(\`Order not found: \${orderId}\`);
      await order.update({ is_ignored: ignore });
      const eventType = ignore ? TimelineService.EVENTS.ORDER_IGNORED : TimelineService.EVENTS.ORDER_UNIGNORED;
      await TimelineService.addEvent(orderId, eventType, ignore ? 'Order ignored by user' : 'Order unignored by user', { department: 'System' });
      console.log(\`✅ Order \${order.order_number} \${ignore ? 'ignored' : 'unignored'}\`);
      return order;
    } catch (error) {
      console.error('❌ Error toggling ignore status:', error);
      throw error;
    }
  }
}

module.exports = OrderService;
