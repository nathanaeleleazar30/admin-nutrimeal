const pool = require('../lib/db');

const adminModel = {
  async findByEmail(email) {
    const sql = 'SELECT * FROM admins WHERE email = ?';
    const [rows] = await pool.query(sql, [email.toLowerCase().trim()]);
    return rows[0] || null;
  },

  async findById(id) {
    const sql = 'SELECT id, name, email, role, created_at FROM admins WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `adm-${Date.now()}`;
    const sql = `
      INSERT INTO admins (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.name,
      data.email.toLowerCase().trim(),
      data.password,
      data.role || 'admin',
    ];
    await pool.query(sql, params);
    return this.findById(id);
  },
};

module.exports = adminModel;
