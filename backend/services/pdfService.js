const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  static async generatePDF(order, department) {
    try {
      const pdfDir = process.env.PDF_STORAGE_PATH || './storage/pdfs';
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      const fileName = `order_${order.order_number}_${department.toLowerCase()}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      this.addHeader(doc, department);
      this.addOrderDetails(doc, order);
      this.addDepartmentSpecificInfo(doc, order, department);
      this.addFooter(doc);
      doc.end();
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      console.log(`✅ PDF generated for ${department}: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`❌ Error generating PDF for ${department}:`, error);
      throw error;
    }
  }

  static addHeader(doc, department) {
    doc.fontSize(20).font('Helvetica-Bold').text(`${department} Order Ticket`, { align: 'center' }).moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' }).moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();
  }

  static addOrderDetails(doc, order) {
    doc.fontSize(12).font('Helvetica-Bold').text('Order Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    const details = [
      ['Order Number:', order.order_number],
      ['Customer Name:', order.customer_name],
      ['Delivery Date:', order.delivery_date || 'Not specified'],
      ['Delivery Time:', order.delivery_time || 'Not specified'],
      ['Shipping Method:', order.shipping_method || 'Standard']
    ];
    details.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(label, { continued: true, width: 150 });
      doc.font('Helvetica').text(` ${value}`);
    });
    doc.moveDown(2);
  }

  static addDepartmentSpecificInfo(doc, order, department) {
    doc.fontSize(12).font('Helvetica-Bold').text('Order Items', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item, index) => {
        doc.font('Helvetica-Bold').text(`${index + 1}. ${item.title || item.name || 'Item'}`);
        doc.font('Helvetica').text(`   Quantity: ${item.quantity || 1}`);
        if (item.variant_title) {
          doc.text(`   Variant: ${item.variant_title}`);
        }
        doc.moveDown(0.5);
      });
    } else {
      doc.text('No items found');
    }
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold').text(`${department} Notes`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    switch (department) {
      case 'DM':
        doc.text('• Verify delivery address and contact information');
        doc.text('• Confirm delivery time slot availability');
        doc.text('• Prepare delivery documentation');
        break;
      case 'Confectionery':
        doc.text('• Check ingredient availability');
        doc.text('• Review customization requirements');
        doc.text('• Allocate production time slot');
        break;
      case 'Design':
        doc.text('• Review design specifications');
        doc.text('• Confirm design approval status');
        doc.text('• Prepare design materials');
        break;
    }
    doc.moveDown();
  }

  static addFooter(doc) {
    const bottomY = doc.page.height - 100;
    doc.moveTo(50, bottomY).lineTo(550, bottomY).stroke();
    doc.fontSize(8).font('Helvetica').text('Order Management Automation System', 50, bottomY + 10, { align: 'center' }).text('This is an automated document', { align: 'center' });
  }

  static async generateAllPDFs(order, departmentStatus) {
    const pdfPaths = {
      dm_pdf_path: null,
      confectionery_pdf_path: null,
      design_pdf_path: null
    };
    try {
      if (departmentStatus.dm_status !== 'NA') {
        pdfPaths.dm_pdf_path = await this.generatePDF(order, 'DM');
      }
      if (departmentStatus.confectionery_status !== 'NA') {
        pdfPaths.confectionery_pdf_path = await this.generatePDF(order, 'Confectionery');
      }
      if (departmentStatus.design_status !== 'NA') {
        pdfPaths.design_pdf_path = await this.generatePDF(order, 'Design');
      }
      return pdfPaths;
    } catch (error) {
      console.error('❌ Error generating PDFs:', error);
      throw error;
    }
  }
}

module.exports = PDFService;
