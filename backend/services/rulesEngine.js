/**
 * Order Processing Rules Engine
 * Determines which departments require printing based on order attributes
 */

class RulesEngine {
  /**
   * Evaluate order and determine department statuses
   * @param {Object} orderData - Shopify order data
   * @returns {Object} Department statuses { dm_status, confectionery_status, design_status }
   */
  static evaluateOrder(orderData) {
    const {
      shipping_method,
      order_items = [],
      product_tags = [],
      delivery_date,
      delivery_time,
      order_type
    } = orderData;

    // Rule 1: Super Extended Delivery
    if (shipping_method === 'Super Extended Delivery') {
      return {
        dm_status: 'Pending',
        confectionery_status: 'Pending',
        design_status: 'Pending',
        rule_applied: 'Super Extended Delivery'
      };
    }

    // Rule 2: Additional Customization Charges
    const hasCustomizationCharges = order_items.some(item => 
      item.title && item.title.includes('Additional Customization Charges')
    );
    if (hasCustomizationCharges) {
      return {
        dm_status: 'Pending',
        confectionery_status: 'Pending',
        design_status: 'Pending',
        rule_applied: 'Additional Customization Charges'
      };
    }

    // Rule 3: Missing Delivery Info
    if (!delivery_date || !delivery_time) {
      return {
        dm_status: 'Pending',
        confectionery_status: 'Pending',
        design_status: 'Pending',
        rule_applied: 'Missing Delivery Info'
      };
    }

    // Rule 4: Draft Orders
    if (order_type === 'Draft') {
      return {
        dm_status: 'Pending',
        confectionery_status: 'Pending',
        design_status: 'Pending',
        rule_applied: 'Draft Order'
      };
    }

    // Rule 5: Designer Cake
    const isDesignerCake = product_tags.some(tag => 
      tag === 'ORDER-MANAGEMENT-AUTOMATION-DESIGNER-CAKE'
    );
    if (isDesignerCake) {
      return {
        dm_status: 'Pending',
        confectionery_status: 'Pending',
        design_status: 'NA',
        rule_applied: 'Designer Cake'
      };
    }

    // Rule 6: Default - All departments require printing
    return {
      dm_status: 'Pending',
      confectionery_status: 'Pending',
      design_status: 'Pending',
      rule_applied: 'Default'
    };
  }

  /**
   * Check if order requires action (has pending/failed/in-progress statuses)
   * @param {Object} departmentStatus - Department status object
   * @returns {Boolean}
   */
  static requiresAction(departmentStatus) {
    const actionStatuses = ['Pending', 'Failure', 'In-Progress'];
    return (
      actionStatuses.includes(departmentStatus.dm_status) ||
      actionStatuses.includes(departmentStatus.confectionery_status) ||
      actionStatuses.includes(departmentStatus.design_status)
    );
  }
}

module.exports = RulesEngine;
