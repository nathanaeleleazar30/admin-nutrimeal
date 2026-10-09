const pool = require('../lib/db');

const voucherModel = {
  async getAll() {
    const sql = 'SELECT * FROM vouchers ORDER BY created_at DESC';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async getById(id) {
    const sql = 'SELECT * FROM vouchers WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async getByCode(code) {
    const sql = 'SELECT * FROM vouchers WHERE code = ?';
    const [rows] = await pool.query(sql, [code.toUpperCase()]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `voc-${Date.now()}`;
    const sql = `
      INSERT INTO vouchers (id, code, title, discount_type, discount_value, max_discount, min_spend, category_tag, badge_text, is_active, quota, used_count, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.code.toUpperCase().trim(),
      data.title,
      data.discount_type || 'nominal',
      Number(data.discount_value),
      data.max_discount ? Number(data.max_discount) : null,
      Number(data.min_spend || 0),
      data.category_tag || 'Semua Menu',
      data.badge_text || null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      Number(data.quota || 100),
      Number(data.used_count || 0),
      data.valid_until || '2026-12-31',
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const sql = `
      UPDATE vouchers
      SET code = ?, title = ?, discount_type = ?, discount_value = ?, max_discount = ?, min_spend = ?, category_tag = ?, badge_text = ?, is_active = ?, quota = ?, valid_until = ?
      WHERE id = ?
    `;
    const params = [
      data.code !== undefined ? data.code.toUpperCase().trim() : existing.code,
      data.title !== undefined ? data.title : existing.title,
      data.discount_type !== undefined ? data.discount_type : existing.discount_type,
      data.discount_value !== undefined ? Number(data.discount_value) : existing.discount_value,
      data.max_discount !== undefined ? (data.max_discount ? Number(data.max_discount) : null) : existing.max_discount,
      data.min_spend !== undefined ? Number(data.min_spend) : existing.min_spend,
      data.category_tag !== undefined ? data.category_tag : existing.category_tag,
      data.badge_text !== undefined ? data.badge_text : existing.badge_text,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
      data.quota !== undefined ? Number(data.quota) : existing.quota,
      data.valid_until !== undefined ? data.valid_until : existing.valid_until,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async toggleStatus(id) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const newStatus = existing.is_active ? 0 : 1;
    const sql = 'UPDATE vouchers SET is_active = ? WHERE id = ?';
    await pool.query(sql, [newStatus, id]);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM vouchers WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = voucherModel;
