const { Order, OrderLineItem, OrderDepartmentStatus } = require('../models');
const { evaluateRules, getRuleDescription } = require('../services/ruleEngine');
const { generatePdf } = require('../services/pdfGenerator');
const { triggerPrint, cancelPrintJobs, notifyFrontend } = require('../services/printService');
const timelineService = require('../services/timelineService');
const OrderPdf = require('../models/OrderPdf');
const { getIO } = require('../config/socket');

function parseDeliveryDate(dateStr) {
  if (!dateStr) return null;
  console.log('parseDeliveryDate', dateStr);
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  return dateStr;
}

function extractDeliveryInfo(payload) {
  const noteAttributes = payload.note_attributes || [];
  const lineItems = payload.line_items || [];
  
  let deliveryDate = null;
  let deliveryTime = null;
  let specificDeliveryTime = null;
  let deliveryDay = null;
  let deliveryLink = null;
  
  for (const attr of noteAttributes) {
    const name = (attr.name || '').toLowerCase();
    if (name === 'delivery date') deliveryDate = attr.value;
    if (name === 'delivery time') deliveryTime = attr.value;
    if (name === 'specific delivery time') specificDeliveryTime = attr.value;
    if (name === 'delivery day') deliveryDay = attr.value;
    if (name === 'delivery link') deliveryLink = attr.value;
  }
  
  for (const item of lineItems) {
    const properties = item.properties || [];
    for (const prop of properties) {
      const name = (prop.name || '').toLowerCase();
      if (!deliveryDate && name === 'delivery date') deliveryDate = prop.value;
      if (!deliveryTime && name === 'delivery time') deliveryTime = prop.value;
      if (!specificDeliveryTime && name === 'specific delivery time') specificDeliveryTime = prop.value;
      if (!deliveryDay && name === 'delivery day') deliveryDay = prop.value;
      if (!deliveryLink && name === 'delivery link') deliveryLink = prop.value;
    }
  }
  
  return {
    delivery_date: parseDeliveryDate(deliveryDate),
    delivery_time: deliveryTime,
    specific_delivery_time: specificDeliveryTime,
    delivery_day: deliveryDay,
    delivery_link: deliveryLink
  };
}

async function handleOrderCreated(req, res) {
  try {
    const payload = req.body;
    const orderId = String(payload.id);
    
    const existingOrder = await Order.findByOrderId(orderId);
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already exists',
        data: {
          order_id: existingOrder.order_id,
          order_number: existingOrder.order_number
        }
      });
    }
    
    const deliveryInfo = extractDeliveryInfo(payload);
    
    const customer = payload.customer || {};
    const shippingAddress = payload.shipping_address || {};
    const shippingLines = payload.shipping_lines || [];
    
    const orderData = {
      order_id: orderId,
      order_number: payload.name || `#${payload.order_number}`,
      customer_name: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Unknown',
      customer_email: payload.email || customer.email,
      customer_phone: customer.phone || shippingAddress.phone,
      delivery_date: deliveryInfo.delivery_date,
      delivery_time: deliveryInfo.delivery_time,
      specific_delivery_time: deliveryInfo.specific_delivery_time,
      delivery_day: deliveryInfo.delivery_day,
      delivery_link: deliveryInfo.delivery_link,
      delivery_related: null,
      product_related: null,
      delivery_instructions: null,
      shipping_method: shippingLines[0]?.title || null,
      shipping_address: shippingAddress,
      notes: payload.note || null,
      reserved: false,
      is_ignored: false,
      is_cancelled: false,
      order_created_at: payload.created_at,
      raw_payload: payload
    };
    
    await Order.create(orderData);
    
    await timelineService.logWebhookReceived(orderId, 'orders/create');
    
    const lineItems = payload.line_items || [];
    for (const item of lineItems) {
      await OrderLineItem.create({
        order_id: orderId,
        shopify_line_item_id: String(item.id),
        title: item.title,
        variant_title: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku,
        product_id: item.product_id ? String(item.product_id) : null,
        variant_id: item.variant_id ? String(item.variant_id) : null,
        image_url: null,
        properties: item.properties
      });
    }
    
    const ruleResult = evaluateRules({
      ...orderData,
      line_items: lineItems,
      tags: payload.tags,
      source: payload.source_name
    });
    
    await OrderDepartmentStatus.create(orderId, {
      dm: ruleResult.dm,
      confectionery: ruleResult.confectionery,
      design: ruleResult.design
    });
    
    await timelineService.logRuleEvaluated(orderId, getRuleDescription(ruleResult.rule));
    
    if (ruleResult.autoTrigger) {
      const departments = ['dm', 'confectionery', 'design'];
      
      for (const dept of departments) {
        if (ruleResult[dept] === 'PENDING') {
          try {
            await triggerPrint(orderId, dept, 'standard', false);
          } catch (error) {
            console.error(`Failed to auto-trigger print for ${dept}:`, error);
          }
        }
      }
    }
    
    try {
      const io = getIO();
      const orderDetail = await Order.getOrderDetail(orderId);
      io.emit('new_order', { order: orderDetail.order });
    } catch (error) {
      console.error('Failed to emit new_order event:', error);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order received and processing started',
      data: {
        order_id: orderId,
        order_number: orderData.order_number
      }
    });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleOrderCancelled(req, res) {
  try {
    const payload = req.body;
    const orderId = String(payload.id);
    
    const order = await Order.findByOrderId(orderId);
    
    if (!order) {
      return res.status(200).json({
        success: true,
        message: 'Order not found, skipping cancellation'
      });
    }
    
    const cancelledJobsCount = await cancelPrintJobs(orderId);
    
    await Order.updateCancelled(orderId, true);
    
    await timelineService.logOrderCancelled(orderId);
    
    try {
      const io = getIO();
      io.emit('order_cancelled', { order_id: orderId });
    } catch (error) {
      console.error('Failed to emit order_cancelled event:', error);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order cancellation processed',
      data: {
        order_id: orderId,
        cancelled_jobs: cancelledJobsCount
      }
    });
  } catch (error) {
    console.error('Error processing cancellation webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  handleOrderCreated,
  handleOrderCancelled
};
