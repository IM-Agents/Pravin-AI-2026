module.exports = async (order) => {
  if (!order.products || order.products.length === 0) {
    return { matched: false };
  }

  const hasDesignerCakeTag = order.products.some(product => {
    const tags = product.tag || '';
    return tags.toUpperCase().includes('ORDER-MANAGEMENT-AUTOMATION-DESIGNER-CAKE');
  });

  if (hasDesignerCakeTag) {
    return {
      matched: true,
      statuses: {
        dm: 'IN-PROGRESS',
        confectionery: 'IN-PROGRESS',
        design: 'NA'
      },
      reason: 'Order contains designer cake product tag'
    };
  }

  return { matched: false };
};