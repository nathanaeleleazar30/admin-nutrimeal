const pool = require('../lib/db');

const subscriptionModel = {
  async getAll() {
    const sql = 'SELECT * FROM subscriptions ORDER BY created_at DESC';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async getById(id) {
    const sql = 'SELECT * FROM subscriptions WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `sub-${Date.now()}`;
    const sql = `
      INSERT INTO subscriptions (
        id, customer_id, customer_name, customer_phone, package_name,
        meal_slot, delivery_time_slot, start_date, end_date,
        days_remaining, total_days, status, pause_reason, auto_renew, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.customer_id,
      data.customer_name,
      data.customer_phone,
      data.package_name,
      data.meal_slot || 'Siang & Malam',
      data.delivery_time_slot || '11.30 – 13.00 WIB (Slot Utama)',
      data.start_date,
      data.end_date,
      Number(data.days_remaining),
      Number(data.total_days),
      data.status || 'Aktif',
      data.pause_reason || null,
      data.auto_renew !== undefined ? (data.auto_renew ? 1 : 0) : 1,
      data.address,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async updateStatus(id, status, pauseReason) {
    const sql = `
      UPDATE subscriptions 
      SET status = ?, pause_reason = ? 
      WHERE id = ?
    `;
    await pool.query(sql, [status, pauseReason || null, id]);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM subscriptions WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = subscriptionModel;
