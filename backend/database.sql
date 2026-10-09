-- ========================================================
-- Database Schema: nutrimeal_db
-- Untuk Project UTS Pemrograman Web Framework (Express + MySQL)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `nutrimeal_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `nutrimeal_db`;

-- --------------------------------------------------------
-- 0. Tabel: admins (Manajemen Akses Dashboard)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'kitchen_staff') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 1. Tabel: customers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(25) NOT NULL,
  `address` TEXT NOT NULL,
  `type` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
  `company_name` VARCHAR(100) NULL,
  `total_orders` INT NOT NULL DEFAULT 0,
  `total_spent` BIGINT NOT NULL DEFAULT 0,
  `active_subscription` VARCHAR(100) NULL,
  `allergies` TEXT NULL,
  `dietary_goals` TEXT NULL,
  `target_calories` INT NULL DEFAULT 1800,
  `joined_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Tabel: meals
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `meals` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Ayam', 'Ikan', 'Daging', 'Seafood', 'Roti') NOT NULL,
  `calories` INT NOT NULL,
  `price` INT NOT NULL,
  `discount_percent` INT NULL DEFAULT 0,
  `image_url` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `tags` TEXT NULL,
  `schedule` VARCHAR(100) NOT NULL,
  `delivery_time` VARCHAR(100) NOT NULL DEFAULT '12:00 - 13:00 WIB',
  `protein` VARCHAR(50) NOT NULL DEFAULT '30g',
  `fat` VARCHAR(50) NOT NULL DEFAULT '10g',
  `carbs` VARCHAR(50) NOT NULL DEFAULT '45g',
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Tabel: packages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `packages` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('Harian', 'Mingguan', 'Bulanan', 'Prasmanan / Event') NOT NULL DEFAULT 'Mingguan',
  `description` TEXT NOT NULL,
  `price` INT NOT NULL,
  `portions` VARCHAR(100) NOT NULL,
  `target_audience` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
  `sales_count` INT NOT NULL DEFAULT 0,
  `percentage` INT NOT NULL DEFAULT 0,
  `color` VARCHAR(20) NOT NULL DEFAULT '#059669',
  `included_meals` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Tabel: orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(25) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `address_detail` VARCHAR(255) NULL,
  `customer_type` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
  `package_name` VARCHAR(150) NOT NULL,
  `package_detail` VARCHAR(255) NULL,
  `menu_name` VARCHAR(150) NULL,
  `menu_detail` VARCHAR(255) NULL,
  `portions_count` INT NOT NULL DEFAULT 1,
  `delivery_schedule` VARCHAR(100) NOT NULL,
  `delivery_batch` ENUM('Pagi/Siang', 'Sore/Malam') NOT NULL DEFAULT 'Pagi/Siang',
  `day` VARCHAR(20) NOT NULL DEFAULT 'Senin',
  `status` ENUM('Diterima', 'Diproses', 'Dikirim', 'Selesai') NOT NULL DEFAULT 'Diterima',
  `total_price` INT NOT NULL,
  `payment_method` VARCHAR(100) NOT NULL DEFAULT 'QRIS',
  `payment_status` ENUM('Lunas', 'Menunggu Pembayaran', 'COD') NOT NULL DEFAULT 'Lunas',
  `courier_name` VARCHAR(100) NULL,
  `courier_notes` TEXT NULL,
  `kitchen_notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Tabel: vouchers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `discount_type` ENUM('nominal', 'percent', 'free_shipping', 'cashback') NOT NULL DEFAULT 'nominal',
  `discount_value` INT NOT NULL,
  `max_discount` INT NULL,
  `min_spend` INT NOT NULL DEFAULT 0,
  `category_tag` VARCHAR(100) NOT NULL DEFAULT 'Semua Menu',
  `badge_text` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `quota` INT NOT NULL DEFAULT 100,
  `used_count` INT NOT NULL DEFAULT 0,
  `valid_until` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. Tabel: subscriptions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(25) NOT NULL,
  `package_name` VARCHAR(150) NOT NULL,
  `meal_slot` ENUM('Makan Siang', 'Makan Malam', 'Siang & Malam', 'Full Day (3x)') NOT NULL DEFAULT 'Siang & Malam',
  `delivery_time_slot` VARCHAR(100) NOT NULL DEFAULT '11.30 – 13.00 WIB (Slot Utama)',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `days_remaining` INT NOT NULL,
  `total_days` INT NOT NULL,
  `status` ENUM('Aktif', 'Dijeda', 'Selesai') NOT NULL DEFAULT 'Aktif',
  `pause_reason` TEXT NULL,
  `auto_renew` TINYINT(1) NOT NULL DEFAULT 1,
  `address` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. Tabel: faqs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- DATA SEED AWAL (DUMMY DATA AWAL SESUAI NUTRI MEAL)
-- ========================================================

-- Admin Akun Default
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
('adm-1', 'Nathanael', 'nathanael@nutrimeal.id', 'nathanael123', 'superadmin');

-- Customers Seed
INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `type`, `company_name`, `total_orders`, `total_spent`, `active_subscription`, `allergies`, `dietary_goals`, `target_calories`, `joined_date`) VALUES
('cst-1', 'Dimas Pratama', 'dimas.pratama@gmail.com', '0812-8890-1122', 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang', 'Personal', NULL, 14, 4200000, 'Paket Diet Sehat Mingguan', 'Kacang Tanah, Udang / Seafood', 'Defisit Kalori, Tinggi Protein', 1650, '2024-03-15'),
('cst-2', 'Amanda Putri', 'amanda.putri@kantor.co.id', '0858-7702-9901', 'Gedung Graha Pena Lt. 4, Jl. Ahmad Yani, Malang', 'Korporat / Kantor', 'PT Digita Kreasi Nusa', 28, 14700000, 'Paket Makan Siang Kantor', 'Gluten (Celiac)', 'Clean Eating, Less Oil & Low Sodium', 1400, '2024-01-10'),
('cst-3', 'Dr. Rio Wicaksono', 'rio.wicaksono@rsud.ac.id', '0819-3331-4455', 'Perumahan Permata Jingga Blok D-12, Malang', 'Personal', NULL, 8, 5440000, 'Paket Family 5 Hari', 'None / Tidak Ada', 'Gizi Seimbang Keluarga, Organic Only', 2100, '2024-06-01');

-- Meals Seed
INSERT INTO `meals` (`id`, `name`, `category`, `calories`, `price`, `discount_percent`, `image_url`, `description`, `tags`, `schedule`, `delivery_time`, `protein`, `fat`, `carbs`, `is_available`) VALUES
('item-1', 'Grilled Chicken Salad', 'Ayam', 450, 20000, 20, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop', 'Juicy Grilled Chicken, Grilled potato, Fresh Broccoli, seasoning parmesan Cheese', 'Dada Ayam Panggang, Brokoli Kukus, Parmesan Cheese', 'Setiap Hari Senin', '12:00 - 13:00 WIB', '35g', '12g', '55g', 1),
('item-2', 'Pepes Tongkol Rempah', 'Ikan', 380, 45000, 0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', 'Pepes ikan tongkol bumbu rempah kuning kaya antioksidan dan omega-3 disajikan hangat.', 'Ikan Tongkol Segar, Kemangi, Kunyit, Nasi Merah', 'Setiap Hari Selasa', '12:00 - 13:00 WIB', '38g', '10g', '30g', 1),
('item-3', 'Fresh Chicken Salad', 'Ayam', 320, 30000, 0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', 'Fresh green salad dengan irisan dada ayam bakar lembut, tomat ceri, dan dressing zaitun.', 'Dada Ayam, Romaine Lettuce, Tomat Ceri, Olive Oil', 'Setiap Hari Rabu', '12:00 - 13:00 WIB', '32g', '8g', '22g', 1),
('item-4', 'Lean Beef Veggie', 'Daging', 520, 40000, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop', 'Tumis daging sapi lada hitam rendah lemak dipadu paprika renyah dan brokoli segar.', 'Daging Sapi Lean, Paprika, Brokoli, Bawang Bombay', 'Setiap Hari Kamis', '12:00 - 13:00 WIB', '42g', '15g', '40g', 1);

-- Packages Seed
INSERT INTO `packages` (`id`, `name`, `type`, `description`, `price`, `portions`, `target_audience`, `sales_count`, `percentage`, `color`, `included_meals`) VALUES
('pkg-1', 'Paket Sehat Diet Mingguan', 'Mingguan', 'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.', 350000, '10 Porsi (Makan Siang & Malam)', 'Personal', 600, 42, '#059669', 'Grilled Chicken, Chicken Salad, Pepes Tongkol'),
('pkg-2', 'Paket Makan Siang Kantor', 'Harian', 'Solusi makan siang bergizi untuk tim perusahaan dengan porsi pas dan higienis.', 525000, '15 Box Prasmanan Mini', 'Korporat / Kantor', 443, 31, '#0284c7', 'Lean Beef Veggie, Chicken Wrap, Grilled Chicken'),
('pkg-3', 'Paket Family Sehat 5 Hari', 'Mingguan', 'Menu variatif lengkap lauk pauk tinggi serat untuk seluruh anggota keluarga.', 680000, '20 Porsi Keluarga', 'Keluarga', 257, 18, '#d97706', 'Pepes Tongkol, Ayam Bowl, Fresh Chicken Salad');

-- Vouchers Seed
INSERT INTO `vouchers` (`id`, `code`, `title`, `discount_type`, `discount_value`, `max_discount`, `min_spend`, `category_tag`, `badge_text`, `is_active`, `quota`, `used_count`, `valid_until`) VALUES
('voc-1', 'NUTRI15K', 'Diskon Rp15.000', 'nominal', 15000, NULL, 75000, 'NutriPay / Saldo', 'TERPILIH', 1, 100, 42, '2026-12-31'),
('voc-2', 'FREEONGKIR', 'Gratis Ongkir s.d. Rp15.000', 'free_shipping', 15000, 15000, 75000, '✓ Semua Menu Diet & Katering', 'REKOMENDASI', 1, 150, 98, '2026-11-30'),
('voc-3', 'DIET30', 'Diskon 30% Katering Sehat', 'percent', 30, 40000, 120000, 'Langganan Baru', '⚡ Terbatas', 1, 50, 21, '2026-10-31');

-- Subscriptions Seed
INSERT INTO `subscriptions` (`id`, `customer_id`, `customer_name`, `customer_phone`, `package_name`, `meal_slot`, `delivery_time_slot`, `start_date`, `end_date`, `days_remaining`, `total_days`, `status`, `pause_reason`, `auto_renew`, `address`) VALUES
('sub-1', 'cst-1', 'Dimas Pratama', '0812-8890-1122', 'Paket Diet Sehat Mingguan', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-10-01', '2026-10-14', 4, 14, 'Aktif', NULL, 1, 'Jl. Soekarno Hatta No. 45, Lowokwaru, Malang'),
('sub-2', 'cst-2', 'Amanda Putri', '0858-7702-9901', 'Paket Makan Siang Kantor', 'Makan Siang', '11.30 – 13.00 WIB (Slot Utama)', '2026-10-01', '2026-10-30', 21, 30, 'Aktif', NULL, 1, 'Gedung Graha Pena Lt. 4, PT Digita Kreasi Nusa, Malang');

-- FAQs Seed
INSERT INTO `faqs` (`id`, `category`, `question`, `answer`, `is_active`) VALUES
('faq-1', 'Pemesanan', 'Bagaimana cara berlangganan katering harian atau mingguan?', 'Pilih paket katering di katalog langganan, tentukan durasi pengiriman, pilih slot jam makan (siang/malam), lalu lakukan pembayaran checkout.', 1),
('faq-2', 'Pengiriman', 'Kapan jam batas pengantaran makanan tiba di alamat?', 'Batch Siang dikirim antara 10:30 - 13:00 WIB, sedangkan Batch Sore/Malam tiba pukul 16:30 - 18:00 WIB sesuai preferensi Anda.', 1),
('faq-3', 'Diet & Alergi', 'Apakah menu bisa dicustom untuk alergen tertentu?', 'Bisa. Harap isi catatan alergi pada profil atau catatan pesanan saat checkout agar koki dapur kami menyesuaikan bahan masakannya.', 1);
