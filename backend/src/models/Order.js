const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  store_client_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  first_name: DataTypes.STRING(255),
  last_name: DataTypes.STRING(255),
  email: DataTypes.STRING(255),
  shipping_address: DataTypes.TEXT,
  shipping_street: DataTypes.STRING(255),
  shipping_city: DataTypes.STRING(255),
  shipping_province: DataTypes.STRING(255),
  shipping_zip: DataTypes.STRING(255),
  shipping_phone: DataTypes.STRING(30),
  company_name: DataTypes.TEXT,
  order_number: DataTypes.INTEGER,
  order_name: DataTypes.STRING(25),
  total: DataTypes.DOUBLE,
  shopify_order_id: {
    type: DataTypes.BIGINT,
    unique: true
  },
  order_status: {
    type: DataTypes.ENUM('0', '1', '2', '3', '4'),
    defaultValue: '0'
  },
  delivery_date: DataTypes.DATEONLY,
  delivery_time: DataTypes.STRING(50),
  notes: DataTypes.TEXT,
  dm_status: {
    type: DataTypes.ENUM('NA', 'PENDING', 'SUCCESS', 'FAILURE', 'IN-PROGRESS'),
    defaultValue: 'PENDING'
  },
  confectionery_status: {
    type: DataTypes.ENUM('NA', 'PENDING', 'SUCCESS', 'FAILURE', 'IN-PROGRESS'),
    defaultValue: 'PENDING'
  },
  design_status: {
    type: DataTypes.ENUM('NA', 'PENDING', 'SUCCESS', 'FAILURE', 'IN-PROGRESS'),
    defaultValue: 'PENDING'
  },
  pdf_path: DataTypes.STRING(500),
  webhook_received_at: DataTypes.DATE,
  rule_evaluated_at: DataTypes.DATE,
  pdf_generated_at: DataTypes.DATE
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;