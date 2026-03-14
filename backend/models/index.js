const Order = require('./Order');
const OrderDepartmentStatus = require('./OrderDepartmentStatus');
const OrderPDF = require('./OrderPDF');
const Printer = require('./Printer');
const OrderTimeline = require('./OrderTimeline');

// Define associations
Order.hasOne(OrderDepartmentStatus, { foreignKey: 'order_id', as: 'departmentStatus' });
OrderDepartmentStatus.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasOne(OrderPDF, { foreignKey: 'order_id', as: 'pdfs' });
OrderPDF.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(OrderTimeline, { foreignKey: 'order_id', as: 'timeline' });
OrderTimeline.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  Order,
  OrderDepartmentStatus,
  OrderPDF,
  Printer,
  OrderTimeline
};
