module.exports = async (order) => {
  if (!order.products || order.products.length === 0) {
    return { matched: false };
  }

  const hasCustomizationCharges = order.products.some(product => {
    const productName = (product.product_name || '').toLowerCase();
    return productName.includes('additional customization charges');
  });

  if (hasCustomizationCharges) {
    return {
      matched: true,
      statuses: {
        dm: 'PENDING',
        confectionery: 'PENDING',
        design: 'PENDING'
      },
      reason: 'Order contains Additional Customization Charges product'
    };
  }

  return { matched: false };
};