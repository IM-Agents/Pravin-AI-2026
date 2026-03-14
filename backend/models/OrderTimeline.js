const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderTimeline = sequelize.define('OrderTimeline', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.ENUM('DM', 'Confectionery', 'Design', 'System'),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'order_timeline',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['event_type'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = OrderTimeline;
