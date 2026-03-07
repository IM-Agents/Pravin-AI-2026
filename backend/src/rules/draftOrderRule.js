module.exports = async (order) => {
  const isDraft = order.order_status === 'draft' || 
                  order.order_name?.toLowerCase().includes('draft') ||
                  order.notes?.toLowerCase().includes('draft order');

  if (isDraft) {
    return {
      matched: true,
      statuses: {
        dm: 'PENDING',
        confectionery: 'PENDING',
        design: 'PENDING'
      },
      reason: 'Order is a draft order'
    };
  }

  return { matched: false };
};