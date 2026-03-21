const { Order, OrderTimeline } = require('../models');
const timelineService = require('../services/timelineService');

async function getActionRequired(req, res) {
  try {
    const { page = 1, limit = 20, order_no, order_date, delivery_date, delivery_slot } = req.query;
    
    const filters = {};
    if (order_no) filters.order_no = order_no;
    if (order_date) filters.order_date = order_date;
    if (delivery_date) filters.delivery_date = delivery_date;
    if (delivery_slot) filters.delivery_slot = delivery_slot;
    
    const result = await Order.getActionRequired(
      filters,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching action required orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
}

async function getAllOrders(req, res) {
  try {
    const { page = 1, limit = 20, order_no, order_date, delivery_date, delivery_slot } = req.query;
    
    const filters = {};
    if (order_no) filters.order_no = order_no;
    if (order_date) filters.order_date = order_date;
    if (delivery_date) filters.delivery_date = delivery_date;
    if (delivery_slot) filters.delivery_slot = delivery_slot;
    
    const result = await Order.getAll(
      filters,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
}

async function getOrderDetail(req, res) {
  try {
    const { order_id } = req.params;
    
    const result = await Order.getOrderDetail(order_id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
}

async function updateIgnoreStatus(req, res) {
  try {
    const { order_id } = req.params;
    const { ignored } = req.body;
    
    if (typeof ignored !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ignored value'
      });
    }
    
    const order = await Order.findByOrderId(order_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await Order.updateIgnored(order_id, ignored);
    
    if (ignored) {
      await timelineService.logOrderIgnored(order_id);
    } else {
      await timelineService.logOrderUnignored(order_id);
    }
    
    res.json({
      success: true,
      message: ignored ? 'Order marked as ignored' : 'Order ignore status removed',
      data: {
        order_id,
        is_ignored: ignored
      }
    });
  } catch (error) {
    console.error('Error updating ignore status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
}

async function getOrderTimeline(req, res) {
  try {
    const { order_id } = req.params;
    
    const order = await Order.findByOrderId(order_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const timeline = await OrderTimeline.findByOrderId(order_id);
    
    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Error fetching order timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline'
    });
  }
}

module.exports = {
  getActionRequired,
  getAllOrders,
  getOrderDetail,
  updateIgnoreStatus,
  getOrderTimeline
};
