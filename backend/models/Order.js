const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  shipping_method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order_items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  product_tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  order_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Regular'
  },
  is_ignored: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  raw_data: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['order_number'] },
    { fields: ['delivery_date'] },
    { fields: ['is_ignored'] }
  ]
});

module.exports = Order;
