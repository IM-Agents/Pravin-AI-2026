const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.pdfDir = process.env.PDF_DIR || path.join(__dirname, '../../pdfs');
    this.ensurePdfDirectory();
  }

  ensurePdfDirectory() {
    if (!fs.existsSync(this.pdfDir)) {
      fs.mkdirSync(this.pdfDir, { recursive: true });
      logger.info(`Created PDF directory: ${this.pdfDir}`);
    }
  }

  async generateOrderPDF(order) {
    try {
      logger.info(`Generating PDF for order ${order.shopify_order_id}`);

      const filename = `order_${order.shopify_order_id}_${Date.now()}.pdf`;
      const filepath = path.join(this.pdfDir, filename);

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        stream.on('finish', () => {
          logger.info(`PDF generated successfully: ${filepath}`);
          resolve(filepath);
        });

        stream.on('error', (error) => {
          logger.error(`Error writing PDF: ${error}`);
          reject(error);
        });

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Order Details', { align: 'center' });
        doc.moveDown();

        // Order Information
        doc.fontSize(14).text('Order Information', { underline: true });
        doc.fontSize(10);
        doc.text(`Order Number: ${order.order_name || 'N/A'}`);
        doc.text(`Shopify Order ID: ${order.shopify_order_id}`);
        doc.text(`Order Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}`);
        doc.text(`Total: $${order.total || '0.00'}`);
        doc.moveDown();

        // Customer Information
        doc.fontSize(14).text('Customer Information', { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${order.first_name || ''} ${order.last_name || ''}`);
        doc.text(`Email: ${order.email || 'N/A'}`);
        doc.text(`Phone: ${order.shipping_phone || 'N/A'}`);
        if (order.company_name) {
          doc.text(`Company: ${order.company_name}`);
        }
        doc.moveDown();

        // Shipping Address
        doc.fontSize(14).text('Shipping Address', { underline: true });
        doc.fontSize(10);
        if (order.shipping_address) {
          doc.text(order.shipping_address);
        } else {
          doc.text(`${order.shipping_street || ''}`);
          doc.text(`${order.shipping_city || ''}, ${order.shipping_province || ''} ${order.shipping_zip || ''}`);
        }
        doc.moveDown();

        // Delivery Information
        doc.fontSize(14).text('Delivery Information', { underline: true });
        doc.fontSize(10);
        doc.text(`Delivery Date: ${order.delivery_date || 'Not specified'}`);
        doc.text(`Delivery Time: ${order.delivery_time || 'Not specified'}`);
        doc.moveDown();

        // Products
        if (order.products && order.products.length > 0) {
          doc.fontSize(14).text('Products', { underline: true });
          doc.fontSize(10);
          
          order.products.forEach((product, index) => {
            doc.text(`${index + 1}. ${product.product_name || 'Unknown Product'}`);
            doc.text(`   SKU: ${product.product_sku || 'N/A'}`);
            doc.text(`   Quantity: ${product.qty || product.product_qty || 1}`);
            if (product.tag) {
              doc.text(`   Tags: ${product.tag}`);
            }
            doc.moveDown(0.5);
          });
        }

        // Notes
        if (order.notes) {
          doc.moveDown();
          doc.fontSize(14).text('Notes', { underline: true });
          doc.fontSize(10);
          doc.text(order.notes);
        }

        // Department Status
        doc.moveDown();
        doc.fontSize(14).text('Department Status', { underline: true });
        doc.fontSize(10);
        doc.text(`DM: ${order.dm_status || 'PENDING'}`);
        doc.text(`Confectionery: ${order.confectionery_status || 'PENDING'}`);
        doc.text(`Design: ${order.design_status || 'PENDING'}`);

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).text(
          `Generated on ${new Date().toLocaleString()}`,
          { align: 'center' }
        );

        doc.end();
      });
    } catch (error) {
      logger.error(`Error generating PDF for order ${order.shopify_order_id}:`, error);
      throw error;
    }
  }

  async deletePDF(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`Deleted PDF: ${filepath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error deleting PDF ${filepath}:`, error);
      throw error;
    }
  }

  getPDFPath(filename) {
    return path.join(this.pdfDir, filename);
  }
}

module.exports = new PDFService();