const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PrinterConfig = sequelize.define('PrinterConfig', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  store_client_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  department: {
    type: DataTypes.ENUM('DM', 'CONFECTIONERY', 'DESIGN'),
    allowNull: false
  },
  printer_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  printer_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  printer_uri: DataTypes.STRING(500),
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_online: DataTypes.BOOLEAN,
  last_status_check: DataTypes.DATE,
  printer_settings: DataTypes.JSON
}, {
  tableName: 'printer_config',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['store_client_id', 'department']
    }
  ]
});

module.exports = PrinterConfig;