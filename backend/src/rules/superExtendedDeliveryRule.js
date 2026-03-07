module.exports = async (order) => {
  const shippingMethod = order.delivery_method_status || '';
  const notes = order.notes || '';
  
  const isSuperExtendedDelivery = 
    shippingMethod.toLowerCase().includes('super extended delivery') ||
    notes.toLowerCase().includes('super extended delivery');

  if (isSuperExtendedDelivery) {
    return {
      matched: true,
      statuses: {
        dm: 'PENDING',
        confectionery: 'PENDING',
        design: 'PENDING'
      },
      reason: 'Order has Super Extended Delivery shipping method'
    };
  }

  return { matched: false };
};