module.exports = async (order) => {
  const hasDeliveryDate = order.delivery_date && order.delivery_date !== null;
  const hasDeliveryTime = order.delivery_time && order.delivery_time !== null && order.delivery_time !== '';

  if (!hasDeliveryDate || !hasDeliveryTime) {
    return {
      matched: true,
      statuses: {
        dm: 'PENDING',
        confectionery: 'PENDING',
        design: 'PENDING'
      },
      reason: `Missing delivery information: ${!hasDeliveryDate ? 'delivery date' : ''} ${!hasDeliveryTime ? 'delivery time' : ''}`.trim()
    };
  }

  return { matched: false };
};