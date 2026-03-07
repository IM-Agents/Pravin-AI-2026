const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LifecycleHistory = sequelize.define('LifecycleHistory', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  store_client_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  order_id: DataTypes.BIGINT,
  tabs: DataTypes.ENUM('0','1','2','3','4','5','6','7','8','9','10','11','12','13'),
  tab_details: DataTypes.TEXT,
  event_type: DataTypes.STRING(100),
  department: DataTypes.ENUM('DM', 'CONFECTIONERY', 'DESIGN', 'ALL'),
  status: DataTypes.ENUM('NA', 'PENDING', 'SUCCESS', 'FAILURE', 'IN-PROGRESS'),
  error_message: DataTypes.TEXT,
  metadata: DataTypes.JSON
}, {
  tableName: 'lifecycle_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LifecycleHistory;