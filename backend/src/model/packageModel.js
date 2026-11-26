const pool = require('../lib/db');

// In-Memory fallback jika MySQL offline
let inMemoryPackages = [
  {
    id: 'pkg-1',
    name: 'Paket Sehat Diet Mingguan',
    type: 'Mingguan',
    description: 'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.',
    price: 350000,
    portions: '10 Porsi (Makan Siang & Malam)',
    target_audience: 'Personal',
    sales_count: 600,
    percentage: 42,
    color: '#059669',
    included_meals: ['Grilled Chicken', 'Chicken Salad', 'Pepes Tongkol'],
  },
  {
    id: 'pkg-popular',
    name: 'Paket Bulanan Lengkap',
    type: 'Bulanan',
    description: '30 Hari • 60x makan (Siang & Malam). Bebas jeda dan gratis ongkir sepuasnya.',
    price: 750000,
    portions: '60 Box (Siang & Malam)',
    target_audience: 'Personal & Keluarga',
    sales_count: 850,
    percentage: 25,
    color: '#0F5132',
    included_meals: ['Ayam Teriyaki', 'Salmon Quinoa', 'Beef Veggie', 'Tofu Bowl'],
  },
  {
    id: 'pkg-2',
    name: 'Paket Makan Siang Kantor',
    type: 'Bulanan',
    description: 'Solusi makan siang bergizi untuk hari kerja dengan porsi pas dan higienis.',
    price: 525000,
    portions: '20 Box Makan Siang',
    target_audience: 'Korporat / Kantor',
    sales_count: 443,
    percentage: 31,
    color: '#0284c7',
    included_meals: ['Lean Beef Veggie', 'Chicken Wrap', 'Grilled Chicken'],
  },
  {
    id: 'pkg-3',
    name: 'Paket Family Sehat 5 Hari',
    type: 'Mingguan',
    description: 'Menu variatif lengkap lauk pauk tinggi serat untuk seluruh anggota keluarga.',
    price: 680000,
    portions: '20 Porsi Keluarga',
    target_audience: 'Keluarga',
    sales_count: 257,
    percentage: 18,
    color: '#d97706',
    included_meals: ['Pepes Tongkol', 'Ayam Bowl', 'Fresh Chicken Salad'],
  },
];

const packageModel = {
  async getAll() {
    try {
      const sql = 'SELECT * FROM packages ORDER BY created_at DESC';
      const [rows] = await pool.query(sql);
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          ...r,
          included_meals: r.included_meals ? r.included_meals.split(',').map((s) => s.trim()) : [],
        }));
      }
    } catch (err) {
      console.warn('[packageModel] DB getAll fallback to memory:', err.message);
    }
    return inMemoryPackages;
  },

  async getById(id) {
    try {
      const sql = 'SELECT * FROM packages WHERE id = ?';
      const [rows] = await pool.query(sql, [id]);
      if (rows && rows[0]) {
        return {
          ...rows[0],
          included_meals: rows[0].included_meals ? rows[0].included_meals.split(',').map((s) => s.trim()) : [],
        };
      }
    } catch (err) {
      console.warn('[packageModel] DB getById fallback to memory:', err.message);
    }
    return inMemoryPackages.find((p) => p.id === id) || null;
  },

  async create(data) {
    const id = data.id || `pkg-${Date.now()}`;
    const mealsStr = Array.isArray(data.included_meals)
      ? data.included_meals.join(', ')
      : data.included_meals || '';

    try {
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
    } catch (err) {
      console.warn('[packageModel] DB create fallback to memory:', err.message);
      const newPkg = {
        id,
        name: data.name,
        type: data.type || 'Mingguan',
        description: data.description || '',
        price: Number(data.price),
        portions: data.portions,
        target_audience: data.target_audience || 'Personal',
        sales_count: Number(data.sales_count || 0),
        percentage: Number(data.percentage || 0),
        color: data.color || '#059669',
        included_meals: Array.isArray(data.included_meals) ? data.included_meals : [mealsStr],
      };
      inMemoryPackages.unshift(newPkg);
      return newPkg;
    }
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const mealsStr = data.included_meals !== undefined
      ? Array.isArray(data.included_meals) ? data.included_meals.join(', ') : data.included_meals
      : existing.included_meals.join(', ');

    try {
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
    } catch (err) {
      console.warn('[packageModel] DB update fallback to memory:', err.message);
      const idx = inMemoryPackages.findIndex((p) => p.id === id);
      if (idx !== -1) {
        inMemoryPackages[idx] = {
          ...inMemoryPackages[idx],
          ...data,
          price: data.price !== undefined ? Number(data.price) : inMemoryPackages[idx].price,
        };
        return inMemoryPackages[idx];
      }
      return null;
    }
  },

  async delete(id) {
    try {
      const sql = 'DELETE FROM packages WHERE id = ?';
      const [result] = await pool.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.warn('[packageModel] DB delete fallback to memory:', err.message);
      const lenBefore = inMemoryPackages.length;
      inMemoryPackages = inMemoryPackages.filter((p) => p.id !== id);
      return inMemoryPackages.length < lenBefore;
    }
  },
};

module.exports = packageModel;
