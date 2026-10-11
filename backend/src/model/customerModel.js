const pool = require('../lib/db');

const customerModel = {
  async getAll(search) {
    let sql = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company_name LIKE ? OR allergies LIKE ? OR dietary_goals LIKE ?)';
      const queryPattern = `%${search}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern, queryPattern, queryPattern);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows.map((r) => ({
      ...r,
      allergies: r.allergies ? r.allergies.split(',').map((s) => s.trim()) : [],
      dietary_goals: r.dietary_goals ? r.dietary_goals.split(',').map((s) => s.trim()) : [],
    }));
  },

  async getById(id) {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      allergies: rows[0].allergies ? rows[0].allergies.split(',').map((s) => s.trim()) : [],
      dietary_goals: rows[0].dietary_goals ? rows[0].dietary_goals.split(',').map((s) => s.trim()) : [],
    };
  },

  async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM customers WHERE email = ? LIMIT 1';
      const [rows] = await pool.query(sql, [email]);
      if (!rows || !rows[0]) return null;
      return {
        ...rows[0],
        allergies: rows[0].allergies ? rows[0].allergies.split(',').map((s) => s.trim()) : [],
        dietary_goals: rows[0].dietary_goals ? rows[0].dietary_goals.split(',').map((s) => s.trim()) : [],
      };
    } catch (err) {
      console.error('Error findByEmail:', err.message);
      return null;
    }
  },

  async findByGoogleId(googleId) {
    try {
      const sql = 'SELECT * FROM customers WHERE google_id = ? LIMIT 1';
      const [rows] = await pool.query(sql, [googleId]);
      if (!rows || !rows[0]) return null;
      return {
        ...rows[0],
        allergies: rows[0].allergies ? rows[0].allergies.split(',').map((s) => s.trim()) : [],
        dietary_goals: rows[0].dietary_goals ? rows[0].dietary_goals.split(',').map((s) => s.trim()) : [],
      };
    } catch (err) {
      // Jika kolom google_id belum ada di tabel lama
      return null;
    }
  },

  async findOrCreateGoogleUser({ googleId, email, name, avatarUrl, phone }) {
    // 1. Cek berdasarkan googleId jika ada
    if (googleId) {
      const byGoogle = await this.findByGoogleId(googleId);
      if (byGoogle) return byGoogle;
    }

    // 2. Cek berdasarkan email
    if (email) {
      const byEmail = await this.findByEmail(email);
      if (byEmail) {
        // Tautkan google_id ke customer yang sudah ada jika belum tertaut
        if ((googleId && !byEmail.google_id) || (phone && !byEmail.phone)) {
          try {
            await pool.query(
              'UPDATE customers SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(avatar_url, ?), phone = CASE WHEN phone = \'\' OR phone IS NULL THEN ? ELSE phone END WHERE id = ?',
              [googleId || null, avatarUrl || null, phone || '', byEmail.id]
            );
          } catch (e) {
            // Abaikan jika error
          }
        }
        return await this.getById(byEmail.id);
      }
    }

    // 3. Daftarkan customer baru otomatis dari akun Google
    const id = `cst-${Date.now()}`;
    try {
      const insertSql = `
        INSERT INTO customers (
          id, name, email, google_id, avatar_url, phone, address, type, company_name,
          total_orders, total_spent, active_subscription, allergies, dietary_goals,
          target_calories, joined_date
        )
        VALUES (?, ?, ?, ?, ?, ?, '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, CURDATE())
      `;
      await pool.query(insertSql, [
        id,
        name || 'Pengguna Baru',
        email,
        googleId || null,
        avatarUrl || null,
        phone || '',
      ]);
    } catch (err) {
      // Fallback jika database belum ada kolom google_id / avatar_url
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        const fallbackSql = `
          INSERT INTO customers (
            id, name, email, phone, address, type, company_name,
            total_orders, total_spent, active_subscription, allergies, dietary_goals,
            target_calories, joined_date
          )
          VALUES (?, ?, ?, '', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, CURDATE())
        `;
        await pool.query(fallbackSql, [
          id,
          name || 'Pengguna Baru',
          email,
        ]);
      } else {
        throw err;
      }
    }

    return await this.getById(id);
  },

  async create(data) {
    const id = data.id || `cst-${Date.now()}`;
    const allergiesStr = Array.isArray(data.allergies) ? data.allergies.join(', ') : data.allergies || '';
    const dietaryStr = Array.isArray(data.dietary_goals) ? data.dietary_goals.join(', ') : data.dietary_goals || '';

    const sql = `
      INSERT INTO customers (
        id, name, email, password, google_id, avatar_url, phone, address,
        type, company_name, total_orders, total_spent, active_subscription,
        allergies, dietary_goals, target_calories, joined_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.email,
      data.password || null,
      data.google_id || null,
      data.avatar_url || null,
      data.phone || '',
      data.address || '',
      data.type || 'Personal',
      data.company_name || null,
      Number(data.total_orders || 0),
      Number(data.total_spent || 0),
      data.active_subscription || null,
      allergiesStr,
      dietaryStr,
      Number(data.target_calories || 1800),
      data.joined_date || new Date().toISOString().slice(0, 10),
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const allergiesStr = data.allergies !== undefined
      ? Array.isArray(data.allergies) ? data.allergies.join(', ') : data.allergies
      : existing.allergies.join(', ');

    const dietaryStr = data.dietary_goals !== undefined
      ? Array.isArray(data.dietary_goals) ? data.dietary_goals.join(', ') : data.dietary_goals
      : existing.dietary_goals.join(', ');

    const sql = `
      UPDATE customers
      SET name = ?, email = ?, phone = ?, address = ?, type = ?, company_name = ?, active_subscription = ?, allergies = ?, dietary_goals = ?, target_calories = ?
      WHERE id = ?
    `;
    const params = [
      data.name !== undefined ? data.name : existing.name,
      data.email !== undefined ? data.email : existing.email,
      data.phone !== undefined ? data.phone : existing.phone,
      data.address !== undefined ? data.address : existing.address,
      data.type !== undefined ? data.type : existing.type,
      data.company_name !== undefined ? data.company_name : existing.company_name,
      data.active_subscription !== undefined ? data.active_subscription : existing.active_subscription,
      allergiesStr,
      dietaryStr,
      data.target_calories !== undefined ? Number(data.target_calories) : existing.target_calories,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM customers WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = customerModel;
