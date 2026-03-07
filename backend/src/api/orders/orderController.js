const { Order, OrderProduct } = require('../../models');
const timelineService = require('../../services/timelineService');
const orderAutomationService = require('../../services/orderAutomationService');
const logger = require('../../utils/logger');
const fs = require('fs');

exports.listOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dm_status,
      confectionery_status,
      design_status,
      search
    } = req.query;

    const where = {};

    if (status) where.order_status = status;
    if (dm_status) where.dm_status = dm_status;
    if (confectionery_status) where.confectionery_status = confectionery_status;
    if (design_status) where.design_status = design_status;

    if (search) {
      where[Op.or] = [
        { order_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderProduct, as: 'products' }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error listing orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [{ model: OrderProduct, as: 'products' }]
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const timeline = await timelineService.getOrderTimeline(id);

    res.json({ success: true, data: timeline });
  } catch (error) {
    logger.error('Error fetching order timeline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.pdf_path || !fs.existsSync(order.pdf_path)) {
      return res.status(404).json({ success: false, error: 'PDF not found' });
    }

    res.download(order.pdf_path, `order_${order.order_name}.pdf`);
  } catch (error) {
    logger.error('Error downloading PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.retryPrint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({ success: false, error: 'Department is required' });
    }

    const result = await orderAutomationService.retryPrintJob(id, department);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error retrying print:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};