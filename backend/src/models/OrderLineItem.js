const { pool } = require('../config/db');

const OrderLineItem = {
  async create(itemData) {
    const sql = `
      INSERT INTO order_line_items (
        order_id, shopify_line_item_id, title, variant_title,
        quantity, price, sku, product_id, variant_id, image_url, properties
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      itemData.order_id,
      itemData.shopify_line_item_id || null,
      itemData.title,
      itemData.variant_title || null,
      itemData.quantity || 1,
      itemData.price || 0,
      itemData.sku || null,
      itemData.product_id || null,
      itemData.variant_id || null,
      itemData.image_url || null,
      JSON.stringify(itemData.properties || null)
    ]);
    
    return result.insertId;
  },
  
  async createBulk(items) {
    for (const item of items) {
      await this.create(item);
    }
  },
  
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM order_line_items WHERE order_id = ?',
      [orderId]
    );
    return rows.map(row => ({
      ...row,
      properties: row.properties ? JSON.parse(row.properties) : null
    }));
  }
};

module.exports = OrderLineItem;
