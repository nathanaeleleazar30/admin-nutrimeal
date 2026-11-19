const pool = require('../lib/db');

const notificationModel = {
  async getByCustomerId(customerId) {
    const sql = `
      SELECT * FROM notifications
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const [rows] = await pool.query(sql, [customerId]);
    return rows.map((r) => ({
      ...r,
      is_read: Boolean(r.is_read),
    }));
  },

  async getUnreadCount(customerId) {
    const sql = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE customer_id = ? AND is_read = FALSE
    `;
    const [rows] = await pool.query(sql, [customerId]);
    return Number(rows[0]?.unread_count || 0);
  },

  async markAsRead(id, customerId) {
    let sql = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    const params = [id];

    if (customerId) {
      sql += ' AND customer_id = ?';
      params.push(customerId);
    }

    const [result] = await pool.query(sql, params);
    return result.affectedRows > 0;
  },

  async markAllAsRead(customerId) {
    const sql = 'UPDATE notifications SET is_read = TRUE WHERE customer_id = ?';
    const [result] = await pool.query(sql, [customerId]);
    return result.affectedRows;
  },

  async create(data) {
    const sql = `
      INSERT INTO notifications (customer_id, title, body, type, route, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(sql, [
      data.customer_id,
      data.title,
      data.body,
      data.type || 'general',
      data.route || '/notifikasi',
      data.is_read ? 1 : 0,
    ]);
    return {
      id: result.insertId,
      ...data,
      is_read: Boolean(data.is_read),
    };
  },
};

module.exports = notificationModel;
