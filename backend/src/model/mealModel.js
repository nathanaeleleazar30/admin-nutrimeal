const pool = require('../lib/db');

// Model adalah SATU-SATUNYA tempat query SQL ke database dengan placeholder '?'
const mealModel = {
  async getAll({ category, search }) {
    let sql = 'SELECT * FROM meals WHERE 1=1';
    const params = [];

    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
      const queryPattern = `%${search}%`;
      params.push(queryPattern, queryPattern, queryPattern);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getById(id) {
    const sql = 'SELECT * FROM meals WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `item-${Date.now()}`;
    const sql = `
      INSERT INTO meals (id, name, category, calories, price, discount_percent, image_url, description, tags, schedule, delivery_time, protein, fat, carbs, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.category,
      Number(data.calories),
      Number(data.price),
      Number(data.discount_percent || 0),
      data.image_url,
      data.description,
      data.tags,
      data.schedule,
      data.delivery_time || '12:00 - 13:00 WIB',
      data.protein || '30g',
      data.fat || '10g',
      data.carbs || '45g',
      data.is_available !== undefined ? (data.is_available ? 1 : 0) : 1,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const sql = `
      UPDATE meals 
      SET name = ?, category = ?, calories = ?, price = ?, discount_percent = ?, image_url = ?, description = ?, tags = ?, schedule = ?, delivery_time = ?, protein = ?, fat = ?, carbs = ?, is_available = ?
      WHERE id = ?
    `;
    const params = [
      data.name !== undefined ? data.name : existing.name,
      data.category !== undefined ? data.category : existing.category,
      data.calories !== undefined ? Number(data.calories) : existing.calories,
      data.price !== undefined ? Number(data.price) : existing.price,
      data.discount_percent !== undefined ? Number(data.discount_percent) : existing.discount_percent,
      data.image_url !== undefined ? data.image_url : existing.image_url,
      data.description !== undefined ? data.description : existing.description,
      data.tags !== undefined ? data.tags : existing.tags,
      data.schedule !== undefined ? data.schedule : existing.schedule,
      data.delivery_time !== undefined ? data.delivery_time : existing.delivery_time,
      data.protein !== undefined ? data.protein : existing.protein,
      data.fat !== undefined ? data.fat : existing.fat,
      data.carbs !== undefined ? data.carbs : existing.carbs,
      data.is_available !== undefined ? (data.is_available ? 1 : 0) : existing.is_available,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM meals WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = mealModel;
