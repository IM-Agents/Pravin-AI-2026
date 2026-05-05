const OrderTimeline = require('../models/OrderTimeline');

async function logEvent(orderId, eventType, department, status, message) {
  try {
    await OrderTimeline.create({
      order_id: orderId,
      event_type: eventType,
      department: department || null,
      status: status || null,
      message: message
    });
  } catch (error) {
    console.error('Failed to log timeline event:', error);
  }
}

async function logWebhookReceived(orderId, webhookType) {
  await logEvent(
    orderId,
    'WEBHOOK_RECEIVED',
    null,
    null,
    `Shopify webhook ${webhookType} received`
  );
}

async function logRuleEvaluated(orderId, ruleDescription) {
  await logEvent(
    orderId,
    'RULE_EVALUATED',
    null,
    null,
    ruleDescription
  );
}

async function logPdfGenerated(orderId, department) {
  await logEvent(
    orderId,
    'PDF_GENERATED',
    department,
    null,
    `PDF generated for ${department.toUpperCase()} department`
  );
}

async function logPrintTriggered(orderId, department, printerName) {
  await logEvent(
    orderId,
    'PRINT_TRIGGERED',
    department,
    'IN-PROGRESS',
    `Print job dispatched to printer ${printerName}`
  );
}

async function logPrintResult(orderId, department, status, message) {
  await logEvent(
    orderId,
    'PRINT_RESULT',
    department,
    status,
    message
  );
}

async function logOrderIgnored(orderId) {
  await logEvent(
    orderId,
    'ORDER_IGNORED',
    null,
    null,
    'Order marked as ignored'
  );
}

async function logOrderUnignored(orderId) {
  await logEvent(
    orderId,
    'ORDER_UNIGNORED',
    null,
    null,
    'Order ignore status removed'
  );
}

async function logOrderCancelled(orderId) {
  await logEvent(
    orderId,
    'ORDER_CANCELLED',
    null,
    null,
    'Order cancelled via Shopify'
  );
}

async function logPrintCancelled(orderId, department) {
  await logEvent(
    orderId,
    'PRINT_CANCELLED',
    department,
    'CANCELLED',
    `Print job cancelled for ${department.toUpperCase()} department`
  );
}

async function logPrinterValidationFailed(orderId, department, reason) {
  await logEvent(
    orderId,
    'PRINTER_VALIDATION_FAILED',
    department,
    'FAILED',
    `Printer validation failed: ${reason}`
  );
}

async function logManualPrintTriggered(orderId, department) {
  console.log('logManualPrintTriggered', orderId, department);
  await logEvent(
    orderId,
    'MANUAL_PRINT_TRIGGERED',
    department,
    null,
    `Manual print triggered for ${department.toUpperCase()} department`
  );
}

module.exports = {
  logEvent,
  logWebhookReceived,
  logRuleEvaluated,
  logPdfGenerated,
  logPrintTriggered,
  logPrintResult,
  logOrderIgnored,
  logOrderUnignored,
  logOrderCancelled,
  logPrintCancelled,
  logPrinterValidationFailed,
  logManualPrintTriggered
};
