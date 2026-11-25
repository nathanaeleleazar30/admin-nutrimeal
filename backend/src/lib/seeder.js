require('dotenv').config();
const mysql = require('mysql2/promise');

async function runSeeder() {
  console.log('🌱 Memulai proses seeding database NutriMeal...');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'nutrimeal_db';
  const port = Number(process.env.DB_PORT) || 3306;

  let connection;

  try {
    // 1. Koneksi awal ke MySQL server (tanpa database spesifik untuk memastikan database ada)
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true,
    });

    console.log(`📡 Terhubung ke MySQL server (${host}:${port})`);

    // 2. Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${database}' siap.`);

    await connection.changeUser({ database });

    // 3. Buat Tabel-tabel
    console.log('📦 Membuat tabel-tabel jika belum ada...');

    // Tabel Admins
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('superadmin', 'admin', 'kitchen_staff') NOT NULL DEFAULT 'admin',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabel Customers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NULL,
        \`google_id\` VARCHAR(100) NULL,
        \`avatar_url\` TEXT NULL,
        \`phone\` VARCHAR(25) NOT NULL DEFAULT '',
        \`address\` TEXT NULL,
        \`type\` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
        \`company_name\` VARCHAR(100) NULL,
        \`total_orders\` INT NOT NULL DEFAULT 0,
        \`total_spent\` BIGINT NOT NULL DEFAULT 0,
        \`active_subscription\` VARCHAR(100) NULL,
        \`allergies\` TEXT NULL,
        \`dietary_goals\` TEXT NULL,
        \`target_calories\` INT NULL DEFAULT 1800,
        \`joined_date\` DATE NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Pastikan kolom baru ada jika tabel customers sudah ada sebelumnya
    try { await connection.query("ALTER TABLE `customers` ADD COLUMN `google_id` VARCHAR(100) NULL AFTER `email`;"); } catch (e) {}
    try { await connection.query("ALTER TABLE `customers` ADD COLUMN `avatar_url` TEXT NULL AFTER `google_id`;"); } catch (e) {}
    try { await connection.query("ALTER TABLE `customers` MODIFY COLUMN `phone` VARCHAR(25) NOT NULL DEFAULT '';"); } catch (e) {}
    try { await connection.query("ALTER TABLE `customers` MODIFY COLUMN `address` TEXT NULL;"); } catch (e) {}

    // Tabel Meals
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`meals\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`category\` ENUM('Ayam', 'Ikan', 'Daging', 'Seafood', 'Roti') NOT NULL,
        \`calories\` INT NOT NULL,
        \`price\` INT NOT NULL,
        \`discount_percent\` INT NULL DEFAULT 0,
        \`image_url\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`tags\` TEXT NULL,
        \`schedule\` VARCHAR(100) NOT NULL,
        \`delivery_time\` VARCHAR(100) NOT NULL DEFAULT '12:00 - 13:00 WIB',
        \`protein\` VARCHAR(50) NOT NULL DEFAULT '30g',
        \`fat\` VARCHAR(50) NOT NULL DEFAULT '10g',
        \`carbs\` VARCHAR(50) NOT NULL DEFAULT '45g',
        \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabel Packages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`packages\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`type\` ENUM('Harian', 'Mingguan', 'Bulanan', 'Prasmanan / Event') NOT NULL DEFAULT 'Mingguan',
        \`description\` TEXT NOT NULL,
        \`price\` INT NOT NULL,
        \`portions\` VARCHAR(100) NOT NULL,
        \`target_audience\` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
        \`sales_count\` INT NOT NULL DEFAULT 0,
        \`percentage\` INT NOT NULL DEFAULT 0,
        \`color\` VARCHAR(20) NOT NULL DEFAULT '#059669',
        \`included_meals\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabel Orders
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`customer_id\` VARCHAR(50) NULL,
        \`customer_name\` VARCHAR(100) NOT NULL,
        \`customer_phone\` VARCHAR(25) NOT NULL,
        \`customer_address\` TEXT NOT NULL,
        \`address_detail\` VARCHAR(255) NULL,
        \`customer_type\` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
        \`package_name\` VARCHAR(150) NOT NULL,
        \`package_detail\` VARCHAR(255) NULL,
        \`menu_name\` VARCHAR(150) NULL,
        \`menu_detail\` VARCHAR(255) NULL,
        \`portions_count\` INT NOT NULL DEFAULT 1,
        \`delivery_schedule\` VARCHAR(100) NOT NULL,
        \`delivery_batch\` ENUM('Pagi/Siang', 'Sore/Malam') NOT NULL DEFAULT 'Pagi/Siang',
        \`day\` VARCHAR(20) NOT NULL DEFAULT 'Senin',
        \`status\` ENUM('Menunggu Pembayaran', 'Diterima', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu Pembayaran',
        \`total_price\` INT NOT NULL,
        \`payment_method\` VARCHAR(100) NOT NULL DEFAULT 'QRIS',
        \`payment_status\` ENUM('Menunggu Pembayaran', 'Lunas', 'COD', 'Dibatalkan', 'Kedaluwarsa') NOT NULL DEFAULT 'Menunggu Pembayaran',
        \`courier_name\` VARCHAR(100) NULL,
        \`courier_notes\` TEXT NULL,
        \`kitchen_notes\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_orders_customer_id\` (\`customer_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Pastikan kolom & enum orders selaras jika tabel orders sudah ada sebelumnya
    try { await connection.query("ALTER TABLE `orders` ADD COLUMN `customer_id` VARCHAR(50) NULL AFTER `id`, ADD INDEX `idx_orders_customer_id` (`customer_id`);"); } catch (e) {}
    try { await connection.query("ALTER TABLE `orders` MODIFY COLUMN `status` ENUM('Menunggu Pembayaran', 'Diterima', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu Pembayaran';"); } catch (e) {}
    try { await connection.query("ALTER TABLE `orders` MODIFY COLUMN `payment_status` ENUM('Menunggu Pembayaran', 'Lunas', 'COD', 'Dibatalkan', 'Kedaluwarsa') NOT NULL DEFAULT 'Menunggu Pembayaran';"); } catch (e) {}

    // Tabel Payments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`order_id\` VARCHAR(50) NOT NULL,
        \`customer_id\` VARCHAR(50) NOT NULL,
        \`provider\` VARCHAR(30) NOT NULL DEFAULT 'midtrans_qris',
        \`provider_order_id\` VARCHAR(50) NOT NULL,
        \`transaction_id\` VARCHAR(100) NULL,
        \`gross_amount\` INT NOT NULL,
        \`qr_string\` TEXT NULL,
        \`qr_url\` TEXT NULL,
        \`status\` ENUM('creating', 'pending', 'paid', 'cancelled', 'expired', 'failed') NOT NULL DEFAULT 'creating',
        \`expires_at\` DATETIME NULL,
        \`paid_at\` DATETIME NULL,
        \`idempotency_key\` CHAR(36) NOT NULL,
        \`request_hash\` CHAR(64) NULL,
        \`midtrans_idempotency_key\` CHAR(36) NULL,
        \`request_snapshot\` JSON NULL,
        \`raw_response\` JSON NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uniq_payments_provider_order_id\` (\`provider_order_id\`),
        UNIQUE KEY \`uniq_payments_customer_idempotency\` (\`customer_id\`, \`idempotency_key\`),
        INDEX \`idx_payments_order_id\` (\`order_id\`),
        INDEX \`idx_payments_customer_status\` (\`customer_id\`, \`status\`),
        CONSTRAINT \`fk_payments_order_id\`
          FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    try { await connection.query("ALTER TABLE `payments` MODIFY COLUMN `status` ENUM('creating', 'pending', 'paid', 'cancelled', 'expired', 'failed') NOT NULL DEFAULT 'creating';"); } catch (e) {}
    try { await connection.query("ALTER TABLE `payments` ADD COLUMN `request_hash` CHAR(64) NULL AFTER `idempotency_key`;"); } catch (e) {}
    try { await connection.query("ALTER TABLE `payments` ADD COLUMN `midtrans_idempotency_key` CHAR(36) NULL AFTER `request_hash`;"); } catch (e) {}

    // Tabel Vouchers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`vouchers\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`title\` VARCHAR(150) NOT NULL,
        \`discount_type\` ENUM('nominal', 'percent', 'free_shipping', 'cashback') NOT NULL DEFAULT 'nominal',
        \`discount_value\` INT NOT NULL,
        \`max_discount\` INT NULL,
        \`min_spend\` INT NOT NULL DEFAULT 0,
        \`category_tag\` VARCHAR(100) NOT NULL DEFAULT 'Semua Menu',
        \`badge_text\` VARCHAR(50) NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`quota\` INT NOT NULL DEFAULT 100,
        \`used_count\` INT NOT NULL DEFAULT 0,
        \`valid_until\` DATE NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabel Subscriptions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`subscriptions\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`customer_id\` VARCHAR(50) NOT NULL,
        \`customer_name\` VARCHAR(100) NOT NULL,
        \`customer_phone\` VARCHAR(25) NOT NULL,
        \`package_name\` VARCHAR(150) NOT NULL,
        \`meal_slot\` ENUM('Makan Siang', 'Makan Malam', 'Siang & Malam', 'Full Day (3x)') NOT NULL DEFAULT 'Siang & Malam',
        \`delivery_time_slot\` VARCHAR(100) NOT NULL DEFAULT '11.30 – 13.00 WIB (Slot Utama)',
        \`start_date\` DATE NOT NULL,
        \`end_date\` DATE NOT NULL,
        \`days_remaining\` INT NOT NULL,
        \`total_days\` INT NOT NULL,
        \`status\` ENUM('Aktif', 'Dijeda', 'Selesai') NOT NULL DEFAULT 'Aktif',
        \`pause_reason\` TEXT NULL,
        \`auto_renew\` TINYINT(1) NOT NULL DEFAULT 1,
        \`address\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tabel FAQs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`faqs\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`question\` TEXT NOT NULL,
        \`answer\` TEXT NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Seluruh tabel berhasil dibuat / sudah ada.');

    // 4. Bersihkan data dummy lama (orders, vouchers, faqs, dummy customers/subs)
    console.log('🧹 Membersihkan data dummy (orders, vouchers, faqs, customers dummy)...');
    await connection.query('DELETE FROM `orders`');
    await connection.query('DELETE FROM `vouchers`');
    await connection.query('DELETE FROM `faqs`');
    await connection.query("DELETE FROM `subscriptions` WHERE `id` NOT IN ('sub-nael', 'sub-raihan')");
    await connection.query("DELETE FROM `customers` WHERE `id` IN ('cst-1', 'cst-2', 'cst-3', 'cst-4', 'cst-5')");

    // 5. Seeding Data Bersih
    console.log('🌱 Menyuntikkan data bersih (admins, customers riil, meals, packages, langganan aktif)...');

    // a. Admins Seed
    const admins = [
      ['adm-1', 'Nathanael', 'nathanael@nutrimeal.id', 'nathanael123', 'superadmin'],
      ['adm-2', 'Siti Saroh', 'siti.admin@nutrimeal.id', 'admin123', 'admin'],
      ['adm-1791733107152', 'Admin Test', 'admin.test@nutrimeal.id', 'Test1234', 'admin'],
    ];
    for (const a of admins) {
      await connection.query(
        'INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `name` = VALUES(`name`), `role` = VALUES(`role`);',
        a
      );
    }
    console.log(`✅ Admins seeded: ${admins.length} akun`);

    // b. Customers Seed (8 Akun Riil Terdaftar)
    const customers = [
      ['cst-1791709332848', 'Test User Google', 'test_google@student.ub.ac.id', null, null, null, '', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-11'],
      ['cst-1791710995015', 'Tes User', 'test_auto_1791710994952@gmail.com', 'Password123', null, null, '08123456789', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-11'],
      ['cst-1791732947116', 'Budi Test', 'budi.test@gmail.com', 'Password123', null, null, '081299988877', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-11'],
      ['cst-1791734190821', 'bintang', 'bintangfatahillah12@gmail.com', 'bintang12', null, null, '87797669180', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-11'],
      ['cst-1792168615665', 'jmbd', 'jmbd@gmail.com', 'jmbd1234', null, null, '83869991137', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-16'],
      ['cst-1792338797831', 'bintang cuki', 'bintangjemjem2@gmail.com', 'bintang12', '111815352387836783187', 'https://lh3.googleusercontent.com/a/ACg8ocJvpR47lYxMaiFWqVpihmc4_9H_bMiEcmLa-3SZg0XMRM51OkBk=s96-c', '812319194987', '', 'Personal', null, 0, 0, null, '', '', 1800, '2026-10-18'],
      ['cst-1792473012910', 'nael', 'nael@gmail.com', 'nael1234', null, null, '8316194848', '', 'Personal', null, 0, 0, 'Paket Bulanan Lengkap', '', '', 1800, '2026-10-20'],
      ['cst-1794419849764', 'Raihan', 'tugasraihan.69@gmail.com', 'Hahaha01', null, null, '85745496617', '', 'Personal', null, 0, 0, 'Paket Bulanan Lengkap', '', '', 1800, '2026-11-11'],
    ];
    for (const c of customers) {
      await connection.query(
        `INSERT INTO \`customers\` (
          \`id\`, \`name\`, \`email\`, \`password\`, \`google_id\`, \`avatar_url\`, \`phone\`, \`address\`, \`type\`, \`company_name\`,
          \`total_orders\`, \`total_spent\`, \`active_subscription\`, \`allergies\`, \`dietary_goals\`, \`target_calories\`, \`joined_date\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`name\` = VALUES(\`name\`),
          \`password\` = VALUES(\`password\`),
          \`google_id\` = VALUES(\`google_id\`),
          \`avatar_url\` = VALUES(\`avatar_url\`),
          \`phone\` = VALUES(\`phone\`),
          \`address\` = VALUES(\`address\`),
          \`type\` = VALUES(\`type\`),
          \`company_name\` = VALUES(\`company_name\`),
          \`total_orders\` = VALUES(\`total_orders\`),
          \`total_spent\` = VALUES(\`total_spent\`),
          \`active_subscription\` = VALUES(\`active_subscription\`),
          \`allergies\` = VALUES(\`allergies\`),
          \`dietary_goals\` = VALUES(\`dietary_goals\`),
          \`target_calories\` = VALUES(\`target_calories\`);`,
        c
      );
    }
    console.log(`✅ Customers seeded: ${customers.length} data`);

    // c. Meals Seed (8 Menu Lengkap)
    const meals = [
      ['item-1', 'Grilled Chicken Salad', 'Ayam', 450, 20000, 20, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop', 'Juicy Grilled Chicken, Grilled potato, Fresh Broccoli, seasoning parmesan Cheese', 'Dada Ayam Panggang, Brokoli Kukus, Parmesan Cheese', 'Setiap Hari Senin', '12:00 - 13:00 WIB', '35g', '12g', '55g', 1],
      ['item-1792338896242', 'bintang lumajang', 'Seafood', 450, 1, 0, '/uploads/meal-WhatsApp-Image-2026--1792338882641-5091.jpeg', 'halo kak ', '', 'Setiap Hari', '12:00 - 13:00 WIB', '35g', '12g', '45g', 1],
      ['item-1792474176533', 'hammad madiun', 'Roti', 450, 30000, 0, '/uploads/meal-WhatsApp-Image-2026--1792474163280-1835.jpeg', 'Menu katering sehat bergizi', '', 'Setiap Hari', '12:00 - 13:00 WIB', '35g', '12g', '45g', 1],
      ['item-2', 'Pepes Tongkol Rempah', 'Ikan', 380, 45000, 0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', 'Pepes ikan tongkol bumbu rempah kuning kaya antioksidan dan omega-3 disajikan hangat.', 'Ikan Tongkol Segar, Kemangi, Kunyit, Nasi Merah', 'Setiap Hari Selasa', '12:00 - 13:00 WIB', '38g', '10g', '30g', 1],
      ['item-3', 'Fresh Chicken Salad', 'Ayam', 320, 30000, 0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', 'Fresh green salad dengan irisan dada ayam bakar lembut, tomat ceri, dan dressing zaitun.', 'Dada Ayam, Romaine Lettuce, Tomat Ceri, Olive Oil', 'Setiap Hari Rabu', '12:00 - 13:00 WIB', '32g', '8g', '22g', 1],
      ['item-4', 'Lean Beef Veggie', 'Daging', 520, 40000, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop', 'Tumis daging sapi lada hitam rendah lemak dipadu paprika renyah dan brokoli segar.', 'Daging Sapi Lean, Paprika, Brokoli, Bawang Bombay', 'Setiap Hari Kamis', '12:00 - 13:00 WIB', '42g', '15g', '40g', 1],
      ['item-5', 'Nutri Ayam Bowl', 'Ayam', 520, 28000, 0, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop', 'Healthy poke bowl dengan suwiran ayam gurih, jagung manis, kubis ungu, dan edamame segar.', 'Suwir Ayam, Jagung Manis, Kubis Ungu, Edamame', 'Setiap Hari Jumat', '12:00 - 13:00 WIB', '36g', '14g', '58g', 1],
      ['item-6', 'Spinach Chicken Wrap', 'Roti', 350, 28000, 0, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop', 'Tortilla bayam lembut membungkus ayam panggang, selada renyah, dan saus yoghurt herbs.', 'Tortilla Bayam, Ayam Panggang, Selada, Yoghurt', 'Setiap Hari Sabtu', '12:00 - 13:00 WIB', '28g', '11g', '38g', 1],
    ];
    for (const m of meals) {
      await connection.query(
        `INSERT INTO \`meals\` (
          \`id\`, \`name\`, \`category\`, \`calories\`, \`price\`, \`discount_percent\`, \`image_url\`,
          \`description\`, \`tags\`, \`schedule\`, \`delivery_time\`, \`protein\`, \`fat\`, \`carbs\`, \`is_available\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`name\` = VALUES(\`name\`),
          \`category\` = VALUES(\`category\`),
          \`calories\` = VALUES(\`calories\`),
          \`price\` = VALUES(\`price\`),
          \`discount_percent\` = VALUES(\`discount_percent\`),
          \`image_url\` = VALUES(\`image_url\`),
          \`description\` = VALUES(\`description\`),
          \`tags\` = VALUES(\`tags\`),
          \`schedule\` = VALUES(\`schedule\`),
          \`delivery_time\` = VALUES(\`delivery_time\`),
          \`protein\` = VALUES(\`protein\`),
          \`fat\` = VALUES(\`fat\`),
          \`carbs\` = VALUES(\`carbs\`),
          \`is_available\` = VALUES(\`is_available\`);`,
        m
      );
    }
    console.log(`✅ Meals seeded: ${meals.length} menu`);

    // d. Packages Seed (5 Paket termasuk paket populer katalog Flutter)
    const packages = [
      ['pkg-1', 'Paket Sehat Diet Mingguan', 'Mingguan', 'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.', 350000, '10 Porsi (Makan Siang & Malam)', 'Personal', 600, 42, '#059669', 'Grilled Chicken, Chicken Salad, Pepes Tongkol'],
      ['pkg-popular', 'Paket Bulanan Lengkap', 'Bulanan', '30 Hari • 60x makan (Siang & Malam). Bebas jeda dan gratis ongkir sepuasnya.', 750000, '60 Box (Siang & Malam)', 'Personal', 850, 25, '#0F5132', 'Ayam Teriyaki, Salmon Quinoa, Beef Veggie, Tofu Bowl'],
      ['pkg-2', 'Paket Makan Siang Kantor', 'Harian', 'Solusi makan siang bergizi untuk tim perusahaan dengan porsi pas dan higienis.', 525000, '15 Box Prasmanan Mini', 'Korporat / Kantor', 443, 31, '#0284c7', 'Lean Beef Veggie, Chicken Wrap, Grilled Chicken'],
      ['pkg-3', 'Paket Family Sehat 5 Hari', 'Mingguan', 'Menu variatif lengkap lauk pauk tinggi serat untuk seluruh anggota keluarga.', 680000, '20 Porsi Keluarga', 'Keluarga', 257, 18, '#d97706', 'Pepes Tongkol, Ayam Bowl, Fresh Chicken Salad'],
      ['pkg-4', 'Prasmanan Rapat & Event', 'Prasmanan / Event', 'Layanan prasmanan sehat premium untuk meeting, seminar, dan acara kantor.', 1250000, '25 Porsi Prasmanan', 'Korporat / Kantor', 128, 9, '#dc2626', 'Lean Beef Veggie, Grilled Chicken Salad, Nutri Ayam Bowl'],
    ];
    for (const p of packages) {
      await connection.query(
        `INSERT INTO \`packages\` (
          \`id\`, \`name\`, \`type\`, \`description\`, \`price\`, \`portions\`, \`target_audience\`,
          \`sales_count\`, \`percentage\`, \`color\`, \`included_meals\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`name\` = VALUES(\`name\`),
          \`type\` = VALUES(\`type\`),
          \`description\` = VALUES(\`description\`),
          \`price\` = VALUES(\`price\`),
          \`portions\` = VALUES(\`portions\`),
          \`target_audience\` = VALUES(\`target_audience\`),
          \`sales_count\` = VALUES(\`sales_count\`),
          \`percentage\` = VALUES(\`percentage\`),
          \`color\` = VALUES(\`color\`),
          \`included_meals\` = VALUES(\`included_meals\`);`,
        p
      );
    }
    console.log(`✅ Packages seeded: ${packages.length} paket`);

    // e. Subscriptions Seed (Langganan User Riil)
    const subscriptions = [
      ['sub-nael', 'cst-1792473012910', 'nael', '08316194848', 'Paket Bulanan Lengkap', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-11-01', '2026-11-30', 20, 30, 'Aktif', null, 1, 'Jl. Candi Mendut No. 5, Malang'],
      ['sub-raihan', 'cst-1794419849764', 'Raihan', '085745496617', 'Paket Bulanan Lengkap', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-11-01', '2026-11-30', 20, 30, 'Aktif', null, 1, 'Jl. Sukarno Hatta No. 10, Malang'],
    ];
    for (const s of subscriptions) {
      await connection.query(
        `INSERT INTO \`subscriptions\` (
          \`id\`, \`customer_id\`, \`customer_name\`, \`customer_phone\`, \`package_name\`,
          \`meal_slot\`, \`delivery_time_slot\`, \`start_date\`, \`end_date\`, \`days_remaining\`,
          \`total_days\`, \`status\`, \`pause_reason\`, \`auto_renew\`, \`address\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`customer_id\` = VALUES(\`customer_id\`),
          \`customer_name\` = VALUES(\`customer_name\`),
          \`customer_phone\` = VALUES(\`customer_phone\`),
          \`package_name\` = VALUES(\`package_name\`),
          \`meal_slot\` = VALUES(\`meal_slot\`),
          \`delivery_time_slot\` = VALUES(\`delivery_time_slot\`),
          \`start_date\` = VALUES(\`start_date\`),
          \`end_date\` = VALUES(\`end_date\`),
          \`days_remaining\` = VALUES(\`days_remaining\`),
          \`total_days\` = VALUES(\`total_days\`),
          \`status\` = VALUES(\`status\`),
          \`pause_reason\` = VALUES(\`pause_reason\`),
          \`auto_renew\` = VALUES(\`auto_renew\`),
          \`address\` = VALUES(\`address\`);`,
        s
      );
    }
    console.log(`✅ Subscriptions seeded: ${subscriptions.length} data`);

    console.log('\n🎉 PROSES SEEDING SELESAI SUKSES 100% (DATA BERSIH)!');
    console.log('📌 Akun Admin: nathanael@nutrimeal.id | Password: nathanael123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSeeder();
