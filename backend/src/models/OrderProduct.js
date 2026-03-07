const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderProduct = sequelize.define('OrderProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_client_id: DataTypes.INTEGER,
  shopify_order_id: DataTypes.STRING(255),
  product_id: DataTypes.BIGINT,
  line_item_id: DataTypes.BIGINT,
  variant_id: DataTypes.BIGINT,
  product_sku: DataTypes.STRING(255),
  product_name: DataTypes.STRING(255),
  product_qty: DataTypes.INTEGER,
  qty: DataTypes.INTEGER,
  tag: DataTypes.STRING(300),
  product_info: DataTypes.TEXT
}, {
  tableName: 'order_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderProduct;