const pool = require('../lib/db');

const packageModel = {
  async getAll() {
    const sql = 'SELECT * FROM packages ORDER BY created_at DESC';
    const [rows] = await pool.query(sql);
    return rows.map((r) => ({
      ...r,
      included_meals: r.included_meals ? r.included_meals.split(',').map((s) => s.trim()) : [],
    }));
  },

  async getById(id) {
    const sql = 'SELECT * FROM packages WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      included_meals: rows[0].included_meals ? rows[0].included_meals.split(',').map((s) => s.trim()) : [],
    };
  },

  async create(data) {
    const id = data.id || `pkg-${Date.now()}`;
    const mealsStr = Array.isArray(data.included_meals)
      ? data.included_meals.join(', ')
      : data.included_meals || '';

    const sql = `
      INSERT INTO packages (id, name, type, description, price, portions, target_audience, sales_count, percentage, color, included_meals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.type || 'Mingguan',
      data.description || '',
      Number(data.price),
      data.portions,
      data.target_audience || 'Personal',
      Number(data.sales_count || 0),
      Number(data.percentage || 0),
      data.color || '#059669',
      mealsStr,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const mealsStr = data.included_meals !== undefined
      ? Array.isArray(data.included_meals) ? data.included_meals.join(', ') : data.included_meals
      : existing.included_meals.join(', ');

    const sql = `
      UPDATE packages
      SET name = ?, type = ?, description = ?, price = ?, portions = ?, target_audience = ?, sales_count = ?, percentage = ?, color = ?, included_meals = ?
      WHERE id = ?
    `;
    const params = [
      data.name !== undefined ? data.name : existing.name,
      data.type !== undefined ? data.type : existing.type,
      data.description !== undefined ? data.description : existing.description,
      data.price !== undefined ? Number(data.price) : existing.price,
      data.portions !== undefined ? data.portions : existing.portions,
      data.target_audience !== undefined ? data.target_audience : existing.target_audience,
      data.sales_count !== undefined ? Number(data.sales_count) : existing.sales_count,
      data.percentage !== undefined ? Number(data.percentage) : existing.percentage,
      data.color !== undefined ? data.color : existing.color,
      mealsStr,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM packages WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = packageModel;
