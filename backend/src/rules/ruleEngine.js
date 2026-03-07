const logger = require('../utils/logger');
const superExtendedDeliveryRule = require('./superExtendedDeliveryRule');
const customizationChargesRule = require('./customizationChargesRule');
const deliveryInfoRule = require('./deliveryInfoRule');
const draftOrderRule = require('./draftOrderRule');
const designerCakeRule = require('./designerCakeRule');
const defaultRule = require('./defaultRule');

class RuleEngine {
  constructor() {
    this.rules = [
      { name: 'Super Extended Delivery', handler: superExtendedDeliveryRule, priority: 1 },
      { name: 'Additional Customization Charges', handler: customizationChargesRule, priority: 2 },
      { name: 'Missing Delivery Information', handler: deliveryInfoRule, priority: 3 },
      { name: 'Draft Order', handler: draftOrderRule, priority: 4 },
      { name: 'Designer Cake Tag', handler: designerCakeRule, priority: 5 },
      { name: 'Default Processing', handler: defaultRule, priority: 6 }
    ];
  }

  async evaluate(order) {
    logger.info(`Starting rule evaluation for order ${order.shopify_order_id}`);

    try {
      for (const rule of this.rules) {
        logger.debug(`Evaluating rule: ${rule.name}`);
        
        const result = await rule.handler(order);
        
        if (result.matched) {
          logger.info(`Rule matched: ${rule.name} for order ${order.shopify_order_id}`, {
            statuses: result.statuses,
            reason: result.reason
          });

          return {
            matched: true,
            ruleName: rule.name,
            statuses: result.statuses,
            reason: result.reason,
            shouldPrint: this.shouldPrint(result.statuses)
          };
        }
      }

      logger.warn(`No rule matched for order ${order.shopify_order_id}`);
      return {
        matched: false,
        ruleName: 'None',
        statuses: {
          dm: 'PENDING',
          confectionery: 'PENDING',
          design: 'PENDING'
        },
        reason: 'No rule matched',
        shouldPrint: false
      };
    } catch (error) {
      logger.error(`Error evaluating rules for order ${order.shopify_order_id}:`, error);
      throw error;
    }
  }

  shouldPrint(statuses) {
    return Object.values(statuses).some(status => 
      status !== 'PENDING' && status !== 'NA'
    );
  }

  getDepartmentsToPrint(statuses) {
    const departments = [];
    
    if (statuses.dm === 'IN-PROGRESS' || statuses.dm === 'SUCCESS') {
      departments.push('DM');
    }
    if (statuses.confectionery === 'IN-PROGRESS' || statuses.confectionery === 'SUCCESS') {
      departments.push('CONFECTIONERY');
    }
    if (statuses.design === 'IN-PROGRESS' || statuses.design === 'SUCCESS') {
      departments.push('DESIGN');
    }
    
    return departments;
  }
}

module.exports = new RuleEngine();