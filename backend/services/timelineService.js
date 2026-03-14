const { OrderTimeline } = require('../models');

class TimelineService {
  static async addEvent(orderId, eventType, message, options = {}) {
    try {
      const { department = null, status = null, metadata = null } = options;
      await OrderTimeline.create({
        order_id: orderId,
        event_type: eventType,
        department,
        status,
        message,
        metadata,
        timestamp: new Date()
      });
      console.log(`✅ Timeline event added: ${eventType} for order ${orderId}`);
    } catch (error) {
      console.error(`❌ Error adding timeline event:`, error);
      throw error;
    }
  }

  static async getTimeline(orderId) {
    try {
      const timeline = await OrderTimeline.findAll({
        where: { order_id: orderId },
        order: [['timestamp', 'DESC']]
      });
      return timeline;
    } catch (error) {
      console.error(`❌ Error fetching timeline:`, error);
      throw error;
    }
  }

  static EVENTS = {
    ORDER_RECEIVED: 'order_received',
    RULE_EVALUATED: 'rule_evaluated',
    PDF_GENERATION_STARTED: 'pdf_generation_started',
    PDF_GENERATED: 'pdf_generated',
    PDF_GENERATION_FAILED: 'pdf_generation_failed',
    PRINT_VALIDATION_STARTED: 'print_validation_started',
    PRINTER_VALIDATED: 'printer_validated',
    PRINTER_VALIDATION_FAILED: 'printer_validation_failed',
    PRINT_JOB_SENT: 'print_job_sent',
    PRINT_STARTED: 'print_started',
    PRINT_COMPLETED: 'print_completed',
    PRINT_FAILED: 'print_failed',
    ORDER_IGNORED: 'order_ignored',
    ORDER_UNIGNORED: 'order_unignored'
  };
}

module.exports = TimelineService;
