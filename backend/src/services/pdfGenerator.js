const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const DEPARTMENT_LABELS = {
  dm: 'DM',
  confectionery: 'CONFECTIONERY',
  design: 'DESIGN'
};

const BADGE_COLORS = {
  reprint: '#FF9800',
  'reprint-cancellation': '#F44336'
};

async function generatePdf(orderData, department, templateType = 'standard') {
  const storagePath = config.pdf.storagePath;
  
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  
  const timestamp = Date.now();
  const filename = `${orderData.order_number.replace('#', '')}_${department}_${templateType}_${timestamp}.pdf`;
  const filepath = path.join(storagePath, filename);
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 40,
        bufferPages: true
      });
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      drawHeader(doc, orderData, department, templateType);
      drawOrderInfo(doc, orderData);
      drawLineItems(doc, orderData.line_items || []);
      drawNotes(doc, orderData.notes);
      drawAdditionalDetails(doc, orderData);
      drawCustomerInfo(doc, orderData);
      drawShippingAddress(doc, orderData.shipping_address);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve({
          filename,
          filepath,
          relativePath: `/generated-pdfs/${filename}`
        });
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

function drawHeader(doc, orderData, department, templateType) {
  const departmentLabel = DEPARTMENT_LABELS[department] || department.toUpperCase();
  
  doc.fontSize(24).font('Helvetica-Bold');
  doc.text(departmentLabel, 40, 40);
  
  if (templateType !== 'standard') {
    const badgeText = templateType.toUpperCase();
    const badgeColor = BADGE_COLORS[templateType] || '#FF9800';
    
    doc.save();
    doc.roundedRect(200, 35, 180, 30, 5).fill(badgeColor);
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold');
    doc.text(badgeText, 210, 43, { width: 160, align: 'center' });
    doc.restore();
  }
  
  doc.moveDown(0.5);
  doc.fillColor('black').fontSize(16).font('Helvetica-Bold');
  doc.text(`${orderData.order_number} • ${orderData.customer_name}`, 40);
  
  const orderDate = new Date(orderData.order_created_at);
  const dateStr = orderDate.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  const timeStr = orderDate.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  doc.fontSize(12).font('Helvetica');
  doc.text(`${dateStr} at ${timeStr}`, 40);
  
  doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke('#CCCCCC');
  doc.moveDown(1);
}

function drawOrderInfo(doc, orderData) {
  doc.y += 10;
}

function drawLineItems(doc, lineItems) {
  if (!lineItems || lineItems.length === 0) {
    doc.fontSize(12).font('Helvetica-Oblique');
    doc.text('No line items', 40);
    doc.moveDown(1);
    return;
  }
  
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Order Items', 40);
  doc.moveDown(0.5);
  
  for (const item of lineItems) {
    const startY = doc.y;
    
    doc.rect(40, startY, 60, 60).stroke('#CCCCCC');
    doc.fontSize(8).font('Helvetica');
    doc.text('IMG', 55, startY + 25);
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(item.title || 'Unknown Product', 110, startY, { width: 350 });
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`x ${item.quantity || 1}`, 480, startY);
    
    if (item.variant_title) {
      doc.text(item.variant_title, 110);
    }
    
    doc.text(`₹${item.price || '0.00'}`, 110);
    
    doc.y = Math.max(doc.y, startY + 70);
    doc.moveDown(0.5);
  }
  
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#CCCCCC');
  doc.moveDown(1);
}

function drawNotes(doc, notes) {
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Notes', 40);
  doc.moveDown(0.3);
  
  doc.fontSize(11).font('Helvetica');
  doc.text(notes || 'No notes from customer', 40, doc.y, { width: 515 });
  
  doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke('#CCCCCC');
  doc.moveDown(1);
}

function drawAdditionalDetails(doc, orderData) {
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Additional Details', 40);
  doc.moveDown(0.3);
  
  const details = [
    { label: 'Delivery Date', value: orderData.delivery_date || '-' },
    { label: 'Delivery Day', value: orderData.delivery_day || '-' },
    { label: 'Delivery Time', value: orderData.delivery_time || '-' },
    { label: 'Specific Delivery Time', value: orderData.specific_delivery_time || '-' },
    { label: 'Delivery Link', value: orderData.delivery_link || '-' },
    { label: 'Delivery Related', value: orderData.delivery_related || '-' },
    { label: 'Product Related', value: orderData.product_related || '-' },
    { label: 'Delivery Instructions', value: orderData.delivery_instructions || '-' }
  ];
  
  doc.fontSize(10).font('Helvetica');
  for (const detail of details) {
    doc.font('Helvetica-Bold').text(`${detail.label}: `, 40, doc.y, { continued: true });
    doc.font('Helvetica').text(detail.value, { width: 450 });
  }
  
  doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke('#CCCCCC');
  doc.moveDown(1);
}

function drawCustomerInfo(doc, orderData) {
  doc.fontSize(14).font('Helvetica-Bold');
  doc.text('Customer', 40);
  doc.moveDown(0.3);
  
  doc.fontSize(11).font('Helvetica');
  doc.text(orderData.customer_name || '-', 40);
  doc.moveDown(0.5);
  
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Contact Information', 40);
  doc.moveDown(0.3);
  
  doc.fontSize(10).font('Helvetica');
  doc.text(orderData.customer_email || '-', 40);
  doc.text(orderData.customer_phone || 'No phone number', 40);
  
  doc.moveDown(0.5);
}

function drawShippingAddress(doc, address) {
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Shipping Address', 40);
  doc.moveDown(0.3);
  
  if (!address) {
    doc.fontSize(10).font('Helvetica');
    doc.text('No shipping address provided', 40);
    return;
  }
  
  doc.fontSize(10).font('Helvetica');
  
  const name = [address.first_name, address.last_name].filter(Boolean).join(' ') || address.name;
  if (name) doc.text(name, 40);
  if (address.address1) doc.text(address.address1, 40);
  if (address.address2) doc.text(address.address2, 40);
  
  const cityLine = [address.zip, address.city, address.province].filter(Boolean).join(' ');
  if (cityLine) doc.text(cityLine, 40);
  if (address.country) doc.text(address.country, 40);
}

module.exports = { generatePdf };
