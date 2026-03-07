const Order = require('./Order');
const OrderProduct = require('./OrderProduct');
const PrinterConfig = require('./PrinterConfig');
const LifecycleHistory = require('./LifecycleHistory');

Order.hasMany(OrderProduct, {
  foreignKey: 'shopify_order_id',
  sourceKey: 'shopify_order_id',
  as: 'products'
});

OrderProduct.belongsTo(Order, {
  foreignKey: 'shopify_order_id',
  targetKey: 'shopify_order_id',
  as: 'order'
});

Order.hasMany(LifecycleHistory, {
  foreignKey: 'order_id',
  sourceKey: 'order_id',
  as: 'timeline'
});

LifecycleHistory.belongsTo(Order, {
  foreignKey: 'order_id',
  targetKey: 'order_id',
  as: 'order'
});

module.exports = {
  Order,
  OrderProduct,
  PrinterConfig,
  LifecycleHistory
};