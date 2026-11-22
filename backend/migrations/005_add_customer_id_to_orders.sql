-- ========================================================
-- Migration: 005_add_customer_id_to_orders.sql
-- Description: Menambahkan kolom customer_id pada tabel orders
--              untuk menghubungkan riwayat pesanan ke akun customer
-- ========================================================

ALTER TABLE `orders`
  ADD COLUMN `customer_id` VARCHAR(50) NULL AFTER `id`,
  ADD INDEX `idx_orders_customer_id` (`customer_id`);
