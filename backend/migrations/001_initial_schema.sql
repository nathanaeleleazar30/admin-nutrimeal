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

CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NULL,
  `google_id` VARCHAR(100) NULL,
  `avatar_url` TEXT NULL,
  `phone` VARCHAR(25) NOT NULL DEFAULT '',
  `address` TEXT NULL,
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