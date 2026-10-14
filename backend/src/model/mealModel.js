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
      Number(data.discount_percent || data.discountPercent || 0),
      data.image_url || data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      data.description || 'Menu katering sehat bergizi',
      Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
      data.schedule || 'Setiap Hari',
      data.delivery_time || data.deliveryTime || '12:00 - 13:00 WIB',
      data.protein || data.nutrition?.protein || '30g',
      data.fat || data.nutrition?.fat || '10g',
      data.carbs || data.nutrition?.carbs || '45g',
      data.is_available !== undefined
        ? (data.is_available ? 1 : 0)
        : (data.isAvailable !== undefined ? (data.isAvailable ? 1 : 0) : 1),
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

    const rawDiscount = data.discount_percent !== undefined ? data.discount_percent : data.discountPercent;
    const rawImage = data.image_url !== undefined ? data.image_url : data.imageUrl;
    const rawDelivery = data.delivery_time !== undefined ? data.delivery_time : data.deliveryTime;
    const rawProtein = data.protein !== undefined ? data.protein : data.nutrition?.protein;
    const rawFat = data.fat !== undefined ? data.fat : data.nutrition?.fat;
    const rawCarbs = data.carbs !== undefined ? data.carbs : data.nutrition?.carbs;
    const rawAvailable = data.is_available !== undefined ? data.is_available : data.isAvailable;
    const rawTags = data.tags !== undefined ? (Array.isArray(data.tags) ? data.tags.join(', ') : data.tags) : existing.tags;

    const params = [
      data.name !== undefined ? data.name : existing.name,
      data.category !== undefined ? data.category : existing.category,
      data.calories !== undefined ? Number(data.calories) : existing.calories,
      data.price !== undefined ? Number(data.price) : existing.price,
      rawDiscount !== undefined ? Number(rawDiscount) : existing.discount_percent,
      rawImage !== undefined ? rawImage : existing.image_url,
      data.description !== undefined ? data.description : existing.description,
      rawTags !== undefined ? rawTags : existing.tags,
      data.schedule !== undefined ? data.schedule : existing.schedule,
      rawDelivery !== undefined ? rawDelivery : existing.delivery_time,
      rawProtein !== undefined ? rawProtein : existing.protein,
      rawFat !== undefined ? rawFat : existing.fat,
      rawCarbs !== undefined ? rawCarbs : existing.carbs,
      rawAvailable !== undefined ? (rawAvailable ? 1 : 0) : existing.is_available,
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
