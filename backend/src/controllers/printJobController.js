const path = require('path');
const fs = require('fs');
const { Order, OrderPdf } = require('../models');
const { triggerPrint } = require('../services/printService');
const timelineService = require('../services/timelineService');
const config = require('../config/env');

async function triggerDepartmentPrint(req, res) {
  try {
    const { order_id, department } = req.params;
    const { type = 'standard' } = req.body;
    
    console.log('triggerDepartmentPrint', order_id, department, type);
    
    if (!['dm', 'confectionery', 'design'].includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }
    
    if (!['standard', 'reprint', 'reprint-cancellation'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template type'
      });
    }
    
    const order = await Order.findByOrderId(order_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await timelineService.logManualPrintTriggered(order_id, department);
    
    const result = await triggerPrint(order_id, department, type, false);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error triggering print:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger print'
    });
  }
}

async function retryDepartmentPrint(req, res) {
  try {
    const { order_id, department } = req.params;
    
    if (!['dm', 'confectionery', 'design'].includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }
    
    const order = await Order.findByOrderId(order_id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await timelineService.logManualPrintTriggered(order_id, department);
    
    const result = await triggerPrint(order_id, department, 'reprint', true);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error retrying print:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retry print'
    });
  }
}

async function downloadDepartmentPdf(req, res) {
  try {
    const { order_id, department } = req.params;
    
    if (!['dm', 'confectionery', 'design'].includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }
    
    const pdfRecord = await OrderPdf.findLatestByOrderAndDepartment(order_id, department);
    
    if (!pdfRecord) {
      return res.status(404).json({
        success: false,
        message: 'PDF not generated yet'
      });
    }
    
    const pdfPath = path.join(config.pdf.storagePath, path.basename(pdfRecord.pdf_path));
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(pdfRecord.pdf_path)}"`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF'
    });
  }
}

module.exports = {
  triggerDepartmentPrint,
  retryDepartmentPrint,
  downloadDepartmentPdf
};
