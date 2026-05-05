const { pool } = require('../config/db');

const Order = {
  async create(orderData) {
    const sql = `
      INSERT INTO orders (
        order_id, order_number, customer_name, customer_email, customer_phone,
        delivery_date, delivery_time, specific_delivery_time, delivery_day,
        delivery_link, delivery_related, product_related, delivery_instructions,
        shipping_method, shipping_address, notes, reserved, is_ignored, is_cancelled,
        order_created_at, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(sql, [
      orderData.order_id,
      orderData.order_number,
      orderData.customer_name,
      orderData.customer_email || null,
      orderData.customer_phone || null,
      orderData.delivery_date || null,
      orderData.delivery_time || null,
      orderData.specific_delivery_time || null,
      orderData.delivery_day || null,
      orderData.delivery_link || null,
      orderData.delivery_related || null,
      orderData.product_related || null,
      orderData.delivery_instructions || null,
      orderData.shipping_method || null,
      JSON.stringify(orderData.shipping_address || null),
      orderData.notes || null,
      orderData.reserved || false,
      orderData.is_ignored || false,
      orderData.is_cancelled || false,
      orderData.order_created_at,
      JSON.stringify(orderData.raw_payload || null)
    ]);
    
    return result.insertId;
  },
  
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );
    if (rows.length > 0) {
      rows[0].shipping_address = rows[0].shipping_address ? JSON.parse(rows[0].shipping_address) : null;
    }
    if(true) {
      let varrr = 'okkkk';
    }
    return rows[0] || null;
  },
  
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    if (rows.length > 0) {
      rows[0].shipping_address = rows[0].shipping_address ? JSON.parse(rows[0].shipping_address) : null;
    }
    return rows[0] || null;
  },
  
  async updateIgnored(orderId, ignored) {
    await pool.execute(
      'UPDATE orders SET is_ignored = ? WHERE order_id = ?',
      [ignored, orderId]
    );
  },
  
  async updateCancelled(orderId, cancelled) {
    await pool.execute(
      'UPDATE orders SET is_cancelled = ? WHERE order_id = ?',
      [cancelled, orderId]
    );
  },
  
  async getActionRequired(filters = {}, page = 1, limit = 20) {
    let sql = `
      SELECT 
        o.id, o.order_id, o.order_number, o.customer_name,
        o.order_created_at, o.delivery_date, o.delivery_time,
        o.specific_delivery_time, o.reserved, o.is_ignored, o.is_cancelled,
        ods.dm_status, ods.confectionery_status, ods.design_status
      FROM orders o
      JOIN order_department_status ods ON o.order_id = ods.order_id
      WHERE o.is_cancelled = FALSE
        AND (
          ods.dm_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
          OR ods.confectionery_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
          OR ods.design_status IN ('PENDING', 'FAILED', 'IN-PROGRESS')
        )
    `;
    
    const params = [];
    
    if (filters.order_no) {
      sql += ' AND o.order_number LIKE ?';
      params.push(`%${filters.order_no}%`);
    }
    
    if (filters.order_date) {
      sql += ' AND DATE(o.order_created_at) = ?';
      params.push(filters.order_date);
    }
    
    if (filters.delivery_date) {
      sql += ' AND o.delivery_date = ?';
      params.push(filters.delivery_date);
    }
    
    if (filters.delivery_slot) {
      sql += ' AND (o.delivery_time LIKE ? OR o.specific_delivery_time LIKE ?)';
      params.push(`%${filters.delivery_slot}%`, `%${filters.delivery_slot}%`);
    }
    
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY o.order_created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    
    const [rows] = await pool.execute(sql, params);
    
    return {
      orders: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  async getAll(filters = {}, page = 1, limit = 20) {
    let sql = `
      SELECT 
        o.id, o.order_id, o.order_number, o.customer_name,
        o.order_created_at, o.delivery_date, o.delivery_time,
        o.specific_delivery_time, o.reserved, o.is_ignored, o.is_cancelled,
        ods.dm_status, ods.confectionery_status, ods.design_status
      FROM orders o
      JOIN order_department_status ods ON o.order_id = ods.order_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.order_no) {
      sql += ' AND o.order_number LIKE ?';
      params.push(`%${filters.order_no}%`);
    }
    
    if (filters.order_date) {
      sql += ' AND DATE(o.order_created_at) = ?';
      params.push(filters.order_date);
    }
    
    if (filters.delivery_date) {
      sql += ' AND o.delivery_date = ?';
      params.push(filters.delivery_date);
    }
    
    if (filters.delivery_slot) {
      sql += ' AND (o.delivery_time LIKE ? OR o.specific_delivery_time LIKE ?)';
      params.push(`%${filters.delivery_slot}%`, `%${filters.delivery_slot}%`);
    }
    
    const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;
    
    sql += ' ORDER BY o.order_created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    
    const [rows] = await pool.execute(sql, params);
    
    return {
      orders: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },
  
  async getOrderDetail(orderId) {
    const [orders] = await pool.execute(
      `SELECT o.*, ods.dm_status, ods.confectionery_status, ods.design_status
       FROM orders o
       JOIN order_department_status ods ON o.order_id = ods.order_id
       WHERE o.order_id = ?`,
      [orderId]
    );
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    order.shipping_address = order.shipping_address ? JSON.parse(order.shipping_address) : null;
    
    const [lineItems] = await pool.execute(
      'SELECT * FROM order_line_items WHERE order_id = ?',
      [orderId]
    );
    
    const [pdfs] = await pool.execute(
      'SELECT department, template_type, pdf_path FROM order_pdfs WHERE order_id = ?',
      [orderId]
    );
    
    const [timeline] = await pool.execute(
      'SELECT * FROM order_timeline WHERE order_id = ? ORDER BY timestamp ASC',
      [orderId]
    );
    
    return {
      order: {
        ...order,
        line_items: lineItems.map(item => ({
          ...item,
          properties: item.properties ? JSON.parse(item.properties) : null
        }))
      },
      pdfs: pdfs.reduce((acc, pdf) => {
        acc[`${pdf.department}_pdf_path`] = pdf.pdf_path;
        return acc;
      }, {}),
      timeline
    };
  }
};

module.exports = Order;
