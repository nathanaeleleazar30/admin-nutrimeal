const pool = require('../lib/db');

const faqModel = {
  async getAll() {
    const sql = 'SELECT * FROM faqs ORDER BY created_at ASC';
    const [rows] = await pool.query(sql);
    return rows;
  },

  async getById(id) {
    const sql = 'SELECT * FROM faqs WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `faq-${Date.now()}`;
    const sql = `
      INSERT INTO faqs (id, category, question, answer, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.category,
      data.question,
      data.answer,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const sql = `
      UPDATE faqs
      SET category = ?, question = ?, answer = ?, is_active = ?
      WHERE id = ?
    `;
    const params = [
      data.category !== undefined ? data.category : existing.category,
      data.question !== undefined ? data.question : existing.question,
      data.answer !== undefined ? data.answer : existing.answer,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM faqs WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = faqModel;
