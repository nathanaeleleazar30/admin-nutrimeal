-- ========================================================
-- Migration: 007_create_payments.sql
-- Description: Menambahkan tabel payments untuk QRIS Midtrans,
--              memperbarui ENUM status & payment_status pada orders,
--              serta menyelaraskan paket populer pada tabel packages.
-- ========================================================

-- 1. Pastikan kolom customer_id ada pada orders jika migrasi dijalankan di skema lama
--    dan tambahkan status 'Menunggu Pembayaran' & 'Dibatalkan' tanpa menghapus nilai lama
ALTER TABLE `orders`
  MODIFY COLUMN `status` ENUM(
    'Menunggu Pembayaran',
    'Diterima',
    'Diproses',
    'Dikirim',
    'Selesai',
    'Dibatalkan'
  ) NOT NULL DEFAULT 'Menunggu Pembayaran',
  MODIFY COLUMN `payment_status` ENUM(
    'Menunggu Pembayaran',
    'Lunas',
    'COD',
    'Dibatalkan',
    'Kedaluwarsa'
  ) NOT NULL DEFAULT 'Menunggu Pembayaran';

-- 2. Tabel payments (transaksi pembayaran QRIS Midtrans)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `provider` VARCHAR(30) NOT NULL DEFAULT 'midtrans_qris',
  `provider_order_id` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(100) NULL,
  `gross_amount` INT NOT NULL,
  `qr_string` TEXT NULL,
  `qr_url` TEXT NULL,
  `status` ENUM('creating', 'pending', 'paid', 'cancelled', 'expired', 'failed') NOT NULL DEFAULT 'creating',
  `expires_at` DATETIME NULL,
  `paid_at` DATETIME NULL,
  `idempotency_key` CHAR(36) NOT NULL,
  `request_hash` CHAR(64) NULL,
  `midtrans_idempotency_key` CHAR(36) NULL,
  `request_snapshot` JSON NULL,
  `raw_response` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_payments_provider_order_id` (`provider_order_id`),
  UNIQUE KEY `uniq_payments_customer_idempotency` (`customer_id`, `idempotency_key`),
  INDEX `idx_payments_order_id` (`order_id`),
  INDEX `idx_payments_customer_status` (`customer_id`, `status`),
  CONSTRAINT `fk_payments_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Pastikan paket populer dari katalog Flutter juga tersedia di DB (tidak menimpa data yang sudah ada)
INSERT IGNORE INTO `packages` (
  `id`, `name`, `type`, `description`, `price`, `portions`, `target_audience`,
  `sales_count`, `percentage`, `color`, `included_meals`
) VALUES (
  'pkg-popular',
  'Paket Bulanan Lengkap',
  'Bulanan',
  '30 Hari • 60x makan (Siang & Malam). Bebas jeda dan gratis ongkir sepuasnya.',
  750000,
  '60 Box (Siang & Malam)',
  'Personal',
  850,
  25,
  '#0F5132',
  'Ayam Teriyaki, Salmon Quinoa, Beef Veggie, Tofu Bowl'
);
