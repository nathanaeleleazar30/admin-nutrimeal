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
        \`phone\` VARCHAR(25) NOT NULL,
        \`address\` TEXT NOT NULL,
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
        \`status\` ENUM('Diterima', 'Diproses', 'Dikirim', 'Selesai') NOT NULL DEFAULT 'Diterima',
        \`total_price\` INT NOT NULL,
        \`payment_method\` VARCHAR(100) NOT NULL DEFAULT 'QRIS',
        \`payment_status\` ENUM('Lunas', 'Menunggu Pembayaran', 'COD') NOT NULL DEFAULT 'Lunas',
        \`courier_name\` VARCHAR(100) NULL,
        \`courier_notes\` TEXT NULL,
        \`kitchen_notes\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

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

    // 4. Seeding Data
    console.log('🌱 Menyuntikkan data seed awal...');

    // a. Admins Seed
    const admins = [
      ['adm-1', 'Nathanael', 'nathanael@nutrimeal.id', 'nathanael123', 'superadmin'],
      ['adm-2', 'Siti Saroh', 'siti.admin@nutrimeal.id', 'admin123', 'admin'],
    ];
    for (const a of admins) {
      await connection.query(
        'INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `name` = VALUES(`name`);',
        a
      );
    }
    console.log(`✅ Admins seeded: ${admins.length} akun`);

    // b. Customers Seed
    const customers = [
      ['cst-1', 'Dimas Pratama', 'dimas.pratama@gmail.com', '0812-8890-1122', 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang', 'Personal', null, 14, 4200000, 'Paket Diet Sehat Mingguan', 'Kacang Tanah, Udang / Seafood', 'Defisit Kalori, Tinggi Protein', 1650, '2024-03-15'],
      ['cst-2', 'Amanda Putri', 'amanda.putri@kantor.co.id', '0858-7702-9901', 'Gedung Graha Pena Lt. 4, Jl. Ahmad Yani, Malang', 'Korporat / Kantor', 'PT Digita Kreasi Nusa', 28, 14700000, 'Paket Makan Siang Kantor', 'Gluten (Celiac)', 'Clean Eating, Less Oil & Low Sodium', 1400, '2024-01-10'],
      ['cst-3', 'Dr. Rio Wicaksono', 'rio.wicaksono@rsud.ac.id', '0819-3331-4455', 'Perumahan Permata Jingga Blok D-12, Malang', 'Personal', null, 8, 5440000, 'Paket Family 5 Hari', 'None / Tidak Ada', 'Gizi Seimbang Keluarga, Organic Only', 2100, '2024-06-01'],
      ['cst-4', 'Citra Kirana', 'citra.procurement@majubersama.com', '0821-6577-8898', 'Kawasan Industri Arjosari Malang', 'Korporat / Kantor', 'PT Maju Bersama', 42, 48500000, 'Prasmanan Rapat Kantor', 'None / Tidak Ada', 'Halal Certified, Executive Healthy Bento', 1800, '2023-11-20'],
      ['cst-5', 'Kevin Tan', 'kevin.tan99@gmail.com', '0877-6411-2233', 'Apartemen Begawan Lt. 12 No. 04, Malang', 'Personal', null, 6, 1110000, 'Paket Diet Sehat Mingguan', 'Laktosa / Susu Sapi', 'Muscle Building, High Protein (120g/hari)', 2200, '2024-08-12'],
    ];
    for (const c of customers) {
      await connection.query(
        'INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `type`, `company_name`, `total_orders`, `total_spent`, `active_subscription`, `allergies`, `dietary_goals`, `target_calories`, `joined_date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);',
        c
      );
    }
    console.log(`✅ Customers seeded: ${customers.length} data`);

    // c. Meals Seed
    const meals = [
      ['item-1', 'Grilled Chicken Salad', 'Ayam', 450, 20000, 20, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop', 'Juicy Grilled Chicken, Grilled potato, Fresh Broccoli, seasoning parmesan Cheese', 'Dada Ayam Panggang, Brokoli Kukus, Parmesan Cheese', 'Setiap Hari Senin', '12:00 - 13:00 WIB', '35g', '12g', '55g', 1],
      ['item-2', 'Pepes Tongkol Rempah', 'Ikan', 380, 45000, 0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', 'Pepes ikan tongkol bumbu rempah kuning kaya antioksidan dan omega-3 disajikan hangat.', 'Ikan Tongkol Segar, Kemangi, Kunyit, Nasi Merah', 'Setiap Hari Selasa', '12:00 - 13:00 WIB', '38g', '10g', '30g', 1],
      ['item-3', 'Fresh Chicken Salad', 'Ayam', 320, 30000, 0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', 'Fresh green salad dengan irisan dada ayam bakar lembut, tomat ceri, dan dressing zaitun.', 'Dada Ayam, Romaine Lettuce, Tomat Ceri, Olive Oil', 'Setiap Hari Rabu', '12:00 - 13:00 WIB', '32g', '8g', '22g', 1],
      ['item-4', 'Lean Beef Veggie', 'Daging', 520, 40000, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop', 'Tumis daging sapi lada hitam rendah lemak dipadu paprika renyah dan brokoli segar.', 'Daging Sapi Lean, Paprika, Brokoli, Bawang Bombay', 'Setiap Hari Kamis', '12:00 - 13:00 WIB', '42g', '15g', '40g', 1],
      ['item-5', 'Nutri Ayam Bowl', 'Ayam', 520, 28000, 0, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop', 'Healthy poke bowl dengan suwiran ayam gurih, jagung manis, kubis ungu, dan edamame segar.', 'Suwir Ayam, Jagung Manis, Kubis Ungu, Edamame', 'Setiap Hari Jumat', '12:00 - 13:00 WIB', '36g', '14g', '58g', 1],
      ['item-6', 'Spinach Chicken Wrap', 'Roti', 350, 28000, 0, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop', 'Tortilla bayam lembut membungkus ayam panggang, selada renyah, dan saus yoghurt herbs.', 'Tortilla Bayam, Ayam Panggang, Selada, Yoghurt', 'Setiap Hari Sabtu', '12:00 - 13:00 WIB', '28g', '11g', '38g', 1],
    ];
    for (const m of meals) {
      await connection.query(
        'INSERT INTO `meals` (`id`, `name`, `category`, `calories`, `price`, `discount_percent`, `image_url`, `description`, `tags`, `schedule`, `delivery_time`, `protein`, `fat`, `carbs`, `is_available`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);',
        m
      );
    }
    console.log(`✅ Meals seeded: ${meals.length} menu`);

    // d. Packages Seed
    const packages = [
      ['pkg-1', 'Paket Sehat Diet Mingguan', 'Mingguan', 'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.', 350000, '10 Porsi (Makan Siang & Malam)', 'Personal', 600, 42, '#059669', 'Grilled Chicken Salad, Fresh Chicken Salad, Pepes Tongkol Rempah'],
      ['pkg-2', 'Paket Makan Siang Kantor', 'Harian', 'Solusi makan siang bergizi untuk tim perusahaan dengan porsi pas dan higienis.', 525000, '15 Box Prasmanan Mini', 'Korporat / Kantor', 443, 31, '#0284c7', 'Lean Beef Veggie, Spinach Chicken Wrap, Grilled Chicken Salad'],
      ['pkg-3', 'Paket Family Sehat 5 Hari', 'Mingguan', 'Menu variatif lengkap lauk pauk tinggi serat untuk seluruh anggota keluarga.', 680000, '20 Porsi Keluarga', 'Keluarga', 257, 18, '#d97706', 'Pepes Tongkol Rempah, Nutri Ayam Bowl, Fresh Chicken Salad'],
      ['pkg-4', 'Prasmanan Rapat & Event', 'Prasmanan / Event', 'Layanan prasmanan sehat premium untuk meeting, seminar, dan acara kantor.', 1250000, '25 Porsi Prasmanan', 'Korporat / Kantor', 128, 9, '#dc2626', 'Lean Beef Veggie, Grilled Chicken Salad, Nutri Ayam Bowl'],
    ];
    for (const p of packages) {
      await connection.query(
        'INSERT INTO `packages` (`id`, `name`, `type`, `description`, `price`, `portions`, `target_audience`, `sales_count`, `percentage`, `color`, `included_meals`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);',
        p
      );
    }
    console.log(`✅ Packages seeded: ${packages.length} paket`);

    // e. Vouchers Seed
    const vouchers = [
      ['voc-1', 'NUTRI15K', 'Diskon Rp15.000', 'nominal', 15000, null, 75000, 'NutriPay / Saldo', 'TERPILIH', 1, 100, 42, '2026-12-31'],
      ['voc-2', 'FREEONGKIR', 'Gratis Ongkir s.d. Rp15.000', 'free_shipping', 15000, 15000, 75000, '✓ Semua Menu Diet & Katering', 'REKOMENDASI', 1, 150, 98, '2026-11-30'],
      ['voc-3', 'DIET30', 'Diskon 30% Katering Sehat', 'percent', 30, 40000, 120000, 'Langganan Baru', '⚡ Terbatas', 1, 50, 21, '2026-10-31'],
      ['voc-4', 'CASHBACK20', 'Cashback 20% Koin Sehat', 'cashback', 20, 10000, 50000, 'Spesial NutriPay', null, 1, 80, 35, '2026-12-31'],
    ];
    for (const v of vouchers) {
      await connection.query(
        'INSERT INTO `vouchers` (`id`, `code`, `title`, `discount_type`, `discount_value`, `max_discount`, `min_spend`, `category_tag`, `badge_text`, `is_active`, `quota`, `used_count`, `valid_until`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);',
        v
      );
    }
    console.log(`✅ Vouchers seeded: ${vouchers.length} promo`);

    // f. Subscriptions Seed
    const subscriptions = [
      ['sub-1', 'cst-1', 'Dimas Pratama', '0812-8890-1122', 'Paket Diet Sehat Mingguan', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-10-01', '2026-10-14', 4, 14, 'Aktif', null, 1, 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang'],
      ['sub-2', 'cst-2', 'Amanda Putri', '0858-7702-9901', 'Paket Makan Siang Kantor', 'Makan Siang', '11.30 – 13.00 WIB (Slot Utama)', '2026-10-01', '2026-10-30', 21, 30, 'Aktif', null, 1, 'Gedung Graha Pena Lt. 4, PT Digita Kreasi Nusa, Malang'],
      ['sub-3', 'cst-3', 'Dr. Rio Wicaksono', '0819-3331-4455', 'Paket Family 5 Hari', 'Siang & Malam', '12.30 – 13.30 WIB (Terakhir Siang)', '2026-10-05', '2026-10-10', 2, 5, 'Dijeda', 'Cuti / Dinas luar kota ke Surabaya', 0, 'Perumahan Permata Jingga Blok D-12, Malang'],
      ['sub-4', 'cst-5', 'Kevin Tan', '0877-6411-2233', 'Paket Diet Sehat Mingguan', 'Makan Siang', '10.30 – 11.30 WIB (Lebih Awal)', '2026-10-08', '2026-10-15', 6, 7, 'Aktif', null, 0, 'Apartemen Begawan Lt. 12 No. 04, Malang'],
    ];
    for (const s of subscriptions) {
      await connection.query(
        'INSERT INTO `subscriptions` (`id`, `customer_id`, `customer_name`, `customer_phone`, `package_name`, `meal_slot`, `delivery_time_slot`, `start_date`, `end_date`, `days_remaining`, `total_days`, `status`, `pause_reason`, `auto_renew`, `address`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);',
        s
      );
    }
    console.log(`✅ Subscriptions seeded: ${subscriptions.length} data`);

    // g. Orders Seed
    const orders = [
      ['ORD-2025091', 'Budi Santoso', '+62 812-3456-7890', 'Menara BCA Lt. 24, Jl. MH Thamrin', 'Jakarta Pusat • Resepsionis Lantai 24', 'Korporat / Kantor', 'Paket Makan Siang Kantor', '3 Box Bento Healthy', 'Grilled Chicken Salad', 'Nasi Merah + Brokoli Kukus (3 Porsi)', 3, '11:30 - 13:00 WIB', 'Pagi/Siang', 'Senin', 'Selesai', 165000, 'Bank Transfer (BCA)', 'Lunas', 'Budi Santoso - Motor 01', 'Titip resepsionis', 'Tidak pakai saus pedas'],
      ['ORD-2025092', 'Siti Nurhaliza', '+62 819-8765-4321', 'Apartemen Sudirman Park Tower A Unit 12B', 'Jakarta Selatan • Lobby Tower A', 'Personal', 'Paket Diet Sehat Mingguan', '1 Porsi Makan Siang', 'Pepes Tongkol Rempah', 'Nasi Merah + Lalapan (1 Porsi)', 1, '11:30 - 13:00 WIB', 'Pagi/Siang', 'Senin', 'Dikirim', 45000, 'QRIS (GoPay)', 'Lunas', 'Budi Santoso - Motor 01', 'Hubungi WA bila sampai', 'Less oil'],
      ['ORD-2025093', 'PT Mega Solusi', '+62 821-1122-3344', 'Gedung Cyber 2 Lt. 8, Jl. HR Rasuna Said', 'Jakarta Selatan • Ruang Meeting Utama', 'Korporat / Kantor', 'Paket Makan Siang Kantor', '12 Box Bento Premium', 'Lean Beef Veggie', 'Nasi Shirataki + Tumis Jagung (12 Porsi)', 12, '11:30 - 13:00 WIB', 'Pagi/Siang', 'Senin', 'Diproses', 660000, 'Bank Transfer (Mandiri)', 'Lunas', 'Ahmad Fauzi - Motor 02', 'Antar tepat pukul 11:45 WIB', 'Sertakan tissue basah dan sendok'],
      ['ORD-2025094', 'dr. Hendra Salim', '+62 856-1109-3321', 'Pondok Indah Golf Apartment Tower 1 Unit 15C', 'Jakarta Selatan • Medical Diet', 'Personal', 'Paket Medical Diet', '2 Porsi Makan Malam Rendah Garam', 'Grilled Chicken Salad', 'Kukus Labu Siam & Jagung (2 Porsi)', 2, '17:00 - 18:30 WIB', 'Sore/Malam', 'Senin', 'Diterima', 104000, 'E-Wallet (GoPay)', 'Lunas', 'Ahmad Fauzi - Motor 02', 'Jangan ditumpuk barang lain', 'Maksimal natrium 2g'],
    ];
    for (const o of orders) {
      await connection.query(
        'INSERT INTO `orders` (`id`, `customer_name`, `customer_phone`, `customer_address`, `address_detail`, `customer_type`, `package_name`, `package_detail`, `menu_name`, `menu_detail`, `portions_count`, `delivery_schedule`, `delivery_batch`, `day`, `status`, `total_price`, `payment_method`, `payment_status`, `courier_name`, `courier_notes`, `kitchen_notes`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);',
        o
      );
    }
    console.log(`✅ Orders seeded: ${orders.length} pesanan`);

    // h. FAQs Seed
    const faqs = [
      ['faq-1', 'Pemesanan', 'Bagaimana cara berlangganan katering harian atau mingguan?', 'Pilih paket katering di katalog langganan, tentukan durasi pengiriman, pilih slot jam makan (siang/malam), lalu lakukan pembayaran checkout.', 1],
      ['faq-2', 'Pengiriman', 'Kapan jam batas pengantaran makanan tiba di alamat?', 'Batch Siang dikirim antara 10:30 - 13:00 WIB, sedangkan Batch Sore/Malam tiba pukul 16:30 - 18:00 WIB sesuai preferensi Anda.', 1],
      ['faq-3', 'Diet & Alergi', 'Apakah menu bisa dicustom untuk alergen tertentu?', 'Bisa. Harap isi catatan alergi pada profil atau catatan pesanan saat checkout agar koki dapur kami menyesuaikan bahan masakannya.', 1],
    ];
    for (const f of faqs) {
      await connection.query(
        'INSERT INTO `faqs` (`id`, `category`, `question`, `answer`, `is_active`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `question` = VALUES(`question`);',
        f
      );
    }
    console.log(`✅ FAQs seeded: ${faqs.length} data`);

    console.log('\n🎉 PROSES SEEDING SELESAI SUKSES 100%!');
    console.log('📌 Akun Admin Login: nathanael@nutrimeal.id | Password: nathanael123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSeeder();
