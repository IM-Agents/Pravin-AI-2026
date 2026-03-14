const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderDepartmentStatus = sequelize.define('OrderDepartmentStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  dm_status: {
    type: DataTypes.ENUM('Pending', 'In-Progress', 'Success', 'Failure', 'NA'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  confectionery_status: {
    type: DataTypes.ENUM('Pending', 'In-Progress', 'Success', 'Failure', 'NA'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  design_status: {
    type: DataTypes.ENUM('Pending', 'In-Progress', 'Success', 'Failure', 'NA'),
    allowNull: false,
    defaultValue: 'Pending'
  }
}, {
  tableName: 'order_department_status',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['dm_status'] },
    { fields: ['confectionery_status'] },
    { fields: ['design_status'] }
  ]
});

module.exports = OrderDepartmentStatus;
