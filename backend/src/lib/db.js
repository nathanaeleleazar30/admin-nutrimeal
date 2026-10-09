const mysql = require('mysql2/promise');
require('dotenv').config();

// Inisialisasi MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nutrimeal_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tes koneksi pool saat inisialisasi
pool.getConnection()
  .then((conn) => {
    console.log('✅ Terhubung ke database MySQL/MariaDB:', process.env.DB_NAME || 'nutrimeal_db');
    conn.release();
  })
  .catch((err) => {
    console.warn('⚠️ Gagal terhubung ke MySQL saat startup (pastikan server MySQL berjalan):', err.message);
  });

module.exports = pool;
