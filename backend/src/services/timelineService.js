const { LifecycleHistory } = require('../models');
const logger = require('../utils/logger');

class TimelineService {
  async logEvent(eventData) {
    try {
      const {
        store_client_id,
        order_id,
        tabs,
        tab_details,
        event_type,
        department = 'ALL',
        status,
        error_message = null,
        metadata = null
      } = eventData;

      const event = await LifecycleHistory.create({
        store_client_id,
        order_id,
        tabs,
        tab_details,
        event_type,
        department,
        status,
        error_message,
        metadata
      });

      logger.info(`Timeline event logged: ${event_type} for order ${order_id}`, {
        department,
        status
      });

      return event;
    } catch (error) {
      logger.error('Error logging timeline event:', error);
      throw error;
    }
  }

  async getOrderTimeline(orderId) {
    try {
      const timeline = await LifecycleHistory.findAll({
        where: { order_id: orderId },
        order: [['created_at', 'ASC']]
      });

      return timeline;
    } catch (error) {
      logger.error(`Error fetching timeline for order ${orderId}:`, error);
      throw error;
    }
  }

  async logWebhookReceived(order) {
    return this.logEvent({
      store_client_id: order.store_client_id,
      order_id: order.order_id,
      tabs: '0',
      tab_details: 'Webhook received from Shopify',
      event_type: 'WEBHOOK_RECEIVED',
      department: 'ALL',
      status: 'SUCCESS'
    });
  }

  async logRuleEvaluation(order, ruleResult) {
    return this.logEvent({
      store_client_id: order.store_client_id,
      order_id: order.order_id,
      tabs: '1',
      tab_details: `Rule evaluated: ${ruleResult.ruleName}`,
      event_type: 'RULE_EVALUATED',
      department: 'ALL',
      status: 'SUCCESS',
      metadata: {
        rule: ruleResult.ruleName,
        reason: ruleResult.reason,
        statuses: ruleResult.statuses
      }
    });
  }

  async logPDFGeneration(order, success, errorMessage = null) {
    return this.logEvent({
      store_client_id: order.store_client_id,
      order_id: order.order_id,
      tabs: '2',
      tab_details: success ? 'PDF generated successfully' : 'PDF generation failed',
      event_type: 'PDF_GENERATION',
      department: 'ALL',
      status: success ? 'SUCCESS' : 'FAILURE',
      error_message: errorMessage
    });
  }

  async logPrintJob(order, department, success, errorMessage = null) {
    return this.logEvent({
      store_client_id: order.store_client_id,
      order_id: order.order_id,
      tabs: '3',
      tab_details: success ? `Print job queued for ${department}` : `Print job failed for ${department}`,
      event_type: 'PRINT_JOB',
      department,
      status: success ? 'SUCCESS' : 'FAILURE',
      error_message: errorMessage
    });
  }

  async logStatusUpdate(order, department, oldStatus, newStatus) {
    return this.logEvent({
      store_client_id: order.store_client_id,
      order_id: order.order_id,
      tabs: '4',
      tab_details: `Status updated from ${oldStatus} to ${newStatus}`,
      event_type: 'STATUS_UPDATE',
      department,
      status: newStatus,
      metadata: {
        old_status: oldStatus,
        new_status: newStatus
      }
    });
  }
}

module.exports = new TimelineService();