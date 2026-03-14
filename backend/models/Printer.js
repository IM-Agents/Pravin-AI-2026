const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Printer = sequelize.define('Printer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  printer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  printer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  machine_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('online', 'offline'),
    allowNull: false,
    defaultValue: 'offline'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  assigned_department: {
    type: DataTypes.ENUM('DM', 'Confectionery', 'Design'),
    allowNull: true
  }
}, {
  tableName: 'printers',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['printer_id'], unique: true },
    { fields: ['machine_id'] },
    { fields: ['assigned_department'] },
    { fields: ['is_active'] },
    { fields: ['status'] }
  ]
});

module.exports = Printer;
