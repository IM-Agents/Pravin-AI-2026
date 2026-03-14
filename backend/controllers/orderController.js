const OrderService = require('../services/orderService');
const TimelineService = require('../services/timelineService');
const { OrderPDF } = require('../models');
const path = require('path');
const fs = require('fs');

class OrderController {
  static async getActionRequiredOrders(req, res) {
    try {
      const orders = await OrderService.getActionRequiredOrders();
      res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
      console.error('❌ Error fetching action required orders:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
      console.error('❌ Error fetching all orders:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOrderTimeline(req, res) {
    try {
      const { orderId } = req.params;
      const timeline = await TimelineService.getTimeline(orderId);
      res.status(200).json({ success: true, count: timeline.length, timeline });
    } catch (error) {
      console.error('❌ Error fetching order timeline:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async downloadDepartmentPDF(req, res) {
    try {
      const { orderId, department } = req.params;
      const validDepartments = ['dm', 'confectionery', 'design'];
      if (!validDepartments.includes(department.toLowerCase())) {
        return res.status(400).json({ success: false, error: 'Invalid department' });
      }
      const orderPDF = await OrderPDF.findOne({ where: { order_id: orderId } });
      if (!orderPDF) return res.status(404).json({ success: false, error: 'Order PDFs not found' });
      const pdfPathField = \`\${department.toLowerCase()}_pdf_path\`;
      const pdfPath = orderPDF[pdfPathField];
      if (!pdfPath) return res.status(404).json({ success: false, error: \`PDF not available for \${department} department\` });
      if (!fs.existsSync(pdfPath)) return res.status(404).json({ success: false, error: 'PDF file not found on server' });
      const fileName = path.basename(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', \`attachment; filename="\${fileName}"\`);
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async toggleIgnoreOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { ignore } = req.body;
      if (typeof ignore !== 'boolean') {
        return res.status(400).json({ success: false, error: 'ignore field must be a boolean' });
      }
      const order = await OrderService.toggleIgnoreOrder(orderId, ignore);
      res.status(200).json({ success: true, message: \`Order \${ignore ? 'ignored' : 'unignored'} successfully\`, order });
    } catch (error) {
      console.error('❌ Error toggling ignore status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = OrderController;
