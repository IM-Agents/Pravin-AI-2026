function evaluateRules(orderData) {
  const result = {
    dm: 'PENDING',
    confectionery: 'PENDING',
    design: 'PENDING',
    rule: 'default',
    autoTrigger: true
  };
  
  const shippingMethod = (orderData.shipping_method || '').toLowerCase();
  if (shippingMethod.includes('super extended')) {
    result.rule = 'super_extended_delivery';
    result.autoTrigger = false;
    return result;
  }
  
  const lineItems = orderData.line_items || [];
  const tags = (orderData.tags || '').toLowerCase();
  
  for (const item of lineItems) {
    const title = (item.title || '').toLowerCase();
    const itemTags = (item.tags || '').toLowerCase();
    
    if (title.includes('customization') || itemTags.includes('customization') || 
        tags.includes('customization')) {
      result.rule = 'additional_customization_charges';
      result.autoTrigger = false;
      return result;
    }
  }
  
  if (!orderData.delivery_date || !orderData.delivery_time) {
    result.rule = 'missing_delivery_info';
    result.autoTrigger = false;
    return result;
  }
  
  if (tags.includes('draft') || orderData.source === 'draft') {
    result.rule = 'draft_order';
    result.autoTrigger = false;
    return result;
  }
  
  for (const item of lineItems) {
    const title = (item.title || '').toLowerCase();
    const itemTags = (item.tags || '').toLowerCase();
    
    if (title.includes('designer cake') || itemTags.includes('designer cake')) {
      result.dm = 'PENDING';
      result.confectionery = 'PENDING';
      result.design = 'NA';
      result.rule = 'designer_cake';
      result.autoTrigger = true;
      return result;
    }
  }
  
  return result;
}

function getRuleDescription(rule) {
  const descriptions = {
    'super_extended_delivery': 'Super Extended Delivery: all departments set to PENDING (manual trigger required)',
    'additional_customization_charges': 'Additional Customization Charges: all departments set to PENDING (manual trigger required)',
    'missing_delivery_info': 'Missing Delivery Info: all departments set to PENDING (manual trigger required)',
    'draft_order': 'Draft Order: all departments set to PENDING (manual trigger required)',
    'designer_cake': 'Designer Cake: DM and Confectionery required, Design not applicable',
    'default': 'Default rule: all departments required'
  };
  
  return descriptions[rule] || 'Unknown rule';
}

module.exports = { evaluateRules, getRuleDescription };
