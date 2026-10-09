const pool = require('../lib/db');

const orderModel = {
  async getAll({ status, batch, day, search }) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'Semua') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (batch && batch !== 'Semua') {
      sql += ' AND delivery_batch = ?';
      params.push(batch);
    }

    if (day && day !== 'Semua' && day !== 'Semua Hari') {
      sql += ' AND day = ?';
      params.push(day);
    }

    if (search) {
      sql += ' AND (id LIKE ? OR customer_name LIKE ? OR package_name LIKE ? OR customer_phone LIKE ? OR customer_address LIKE ? OR courier_name LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getById(id) {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  async create(data) {
    const id = data.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const sql = `
      INSERT INTO orders (
        id, customer_name, customer_phone, customer_address, address_detail, customer_type,
        package_name, package_detail, menu_name, menu_detail, portions_count,
        delivery_schedule, delivery_batch, day, status, total_price,
        payment_method, payment_status, courier_name, courier_notes, kitchen_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.customer_name,
      data.customer_phone,
      data.customer_address,
      data.address_detail || null,
      data.customer_type || 'Personal',
      data.package_name,
      data.package_detail || null,
      data.menu_name || null,
      data.menu_detail || null,
      Number(data.portions_count || 1),
      data.delivery_schedule || '11:30 - 13:00 WIB',
      data.delivery_batch || 'Pagi/Siang',
      data.day || 'Senin',
      data.status || 'Diterima',
      Number(data.total_price),
      data.payment_method || 'QRIS',
      data.payment_status || 'Lunas',
      data.courier_name || null,
      data.courier_notes || null,
      data.kitchen_notes || null,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async updateStatus(id, status) {
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    await pool.query(sql, [status, id]);
    return this.getById(id);
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const sql = `
      UPDATE orders
      SET status = ?, courier_name = ?, courier_notes = ?, kitchen_notes = ?, delivery_batch = ?, delivery_schedule = ?
      WHERE id = ?
    `;
    const params = [
      data.status !== undefined ? data.status : existing.status,
      data.courier_name !== undefined ? data.courier_name : existing.courier_name,
      data.courier_notes !== undefined ? data.courier_notes : existing.courier_notes,
      data.kitchen_notes !== undefined ? data.kitchen_notes : existing.kitchen_notes,
      data.delivery_batch !== undefined ? data.delivery_batch : existing.delivery_batch,
      data.delivery_schedule !== undefined ? data.delivery_schedule : existing.delivery_schedule,
      id,
    ];

    await pool.query(sql, params);
    return this.getById(id);
  },

  async delete(id) {
    const sql = 'DELETE FROM orders WHERE id = ?';
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = orderModel;
