-- ========================================================
-- Migration: 006_create_chat_tables.sql
-- Description: Menambahkan tabel percakapan dan pesan chat
--              untuk sinkronisasi live chat antara Web Admin & Mobile
-- ========================================================

CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customer_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(25) NOT NULL DEFAULT '',
  `customer_type` ENUM('Personal', 'Korporat / Kantor', 'Keluarga') NOT NULL DEFAULT 'Personal',
  `last_message` TEXT NULL,
  `last_time` VARCHAR(20) NOT NULL DEFAULT '',
  `unread_count` INT NOT NULL DEFAULT 0,
  `is_online` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_chat_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `conversation_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `sender` ENUM('admin', 'customer') NOT NULL,
  `text` TEXT NOT NULL,
  `time` VARCHAR(20) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `ticket_id` VARCHAR(50) NULL,
  `ticket_category` VARCHAR(50) NULL,
  `ticket_title` VARCHAR(150) NULL,
  `ticket_details` TEXT NULL,
  `ticket_status` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_msg_conv` (`conversation_id`),
  INDEX `idx_msg_cust` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Percakapan Default Awal
INSERT IGNORE INTO `chat_conversations` (`id`, `customer_id`, `customer_name`, `customer_phone`, `customer_type`, `last_message`, `last_time`, `unread_count`, `is_online`)
VALUES
('conv-1', 'cst-1', 'Andi Pratama', '+62 812-4491-0021', 'Personal', 'Siap Kak Andi!, catatan zero-waste sudah kami tambahkan 🌱', '10:21', 0, 1),
('conv-2', 'cst-2', 'Amanda Wijaya', '+62 821-9980-1123', 'Korporat / Kantor', 'Kami butuh tambah 5 box untuk besok', '09:30', 1, 1),
('conv-3', 'cst-3', 'Bambang Prakoso', '+62 813-7720-9944', 'Personal', 'Terima kasih, makanannya enak sekali!', '08:15', 0, 0);

-- Seed Pesan Awal Percakapan conv-1
INSERT IGNORE INTO `chat_messages` (`id`, `conversation_id`, `customer_id`, `sender`, `text`, `time`, `is_read`, `ticket_id`, `ticket_category`, `ticket_title`, `ticket_details`, `ticket_status`)
VALUES
('m1', 'conv-1', 'cst-1', 'admin', 'Halo! 👋 Selamat datang di layanan NutriCare! Saya dari tim Customer Care & Ahli Gizi NutriMeal. Ada kendala jadwal pengiriman katering, perubahan alamat, atau konsultasi menu diet yang bisa kami bantu hari ini?', '10:15', 1, NULL, NULL, NULL, NULL, NULL),
('m2', 'conv-1', 'cst-1', 'customer', 'Halo Kak, besok siang jam 11:30 katering saya mau dialihkan ke kantor di SCBD Lot 18 lantai 12 apa masih sempat diproses? Soalnya pagi ada rapat dadakan.', '10:17', 1, NULL, NULL, NULL, NULL, NULL),
('m3', 'conv-1', 'cst-1', 'admin', 'Tentu bisa Kak Andi! Perubahan alamat makan siang untuk besok kami terima maksimal pukul 19:00 WIB malam ini. Sudah kami catat dan update ke sistem kurir katering ya.', '10:19', 1, 'TKT-8842', 'Ubah Alamat', 'Tiket Perubahan Alamat Pengiriman SCBD', 'Gedung SCBD Lot 18, Lantai 12 (Rapat). Slot: 11:30 - 13:00 WIB', 'Terverifikasi'),
('m4', 'conv-1', 'cst-1', 'customer', 'Mantap, terima kasih banyak Kak! Kurirnya tolong ingatkan jangan pakai sendok plastik ya, di kantor sudah ada cutlery.', '10:20', 1, NULL, NULL, NULL, NULL, NULL),
('m5', 'conv-1', 'cst-1', 'admin', 'Siap Kak Andi!, catatan zero-waste (tanpa alat makan plastik) sudah kami tambahkan ke slip pengiriman kurir. Selamat beristirahat dan menikmati menu NutriMeal besok! 🌱', '10:21', 1, NULL, NULL, NULL, NULL, NULL);
