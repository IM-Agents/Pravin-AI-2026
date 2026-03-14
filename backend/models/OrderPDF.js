const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderPDF = sequelize.define('OrderPDF', {
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
  dm_pdf_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confectionery_pdf_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  design_pdf_path: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'order_pdfs',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['order_id'], unique: true }
  ]
});

module.exports = OrderPDF;

