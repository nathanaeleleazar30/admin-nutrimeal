-- ========================================================
-- Migration: 008_alter_payments_idempotency.sql
-- Description: Menambahkan state 'creating', request_hash, midtrans_idempotency_key,
--              dan UNIQUE (customer_id, idempotency_key) pada tabel payments.
-- ========================================================

UPDATE `payments` SET `customer_id` = '' WHERE `customer_id` IS NULL;
UPDATE `payments`
SET `idempotency_key` = LOWER(CONCAT(
  SUBSTRING(SHA2(`idempotency_key`, 256), 1, 8), '-',
  SUBSTRING(SHA2(`idempotency_key`, 256), 9, 4), '-4',
  SUBSTRING(SHA2(`idempotency_key`, 256), 14, 3), '-8',
  SUBSTRING(SHA2(`idempotency_key`, 256), 18, 3), '-',
  SUBSTRING(SHA2(`idempotency_key`, 256), 21, 12)
))
WHERE CHAR_LENGTH(`idempotency_key`) > 36;

ALTER TABLE `payments`
  MODIFY COLUMN `customer_id` VARCHAR(50) NOT NULL,
  MODIFY COLUMN `status` ENUM('creating', 'pending', 'paid', 'cancelled', 'expired', 'failed') NOT NULL DEFAULT 'creating',
  MODIFY COLUMN `idempotency_key` CHAR(36) NOT NULL;

SET @has_req_hash = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'payments'
    AND column_name = 'request_hash'
);
SET @sql_req_hash = IF(
  @has_req_hash = 0,
  'ALTER TABLE `payments` ADD COLUMN `request_hash` CHAR(64) NULL AFTER `idempotency_key`',
  'SELECT 1'
);
PREPARE stmt_req_hash FROM @sql_req_hash;
EXECUTE stmt_req_hash;
DEALLOCATE PREPARE stmt_req_hash;

SET @has_mid_key = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'payments'
    AND column_name = 'midtrans_idempotency_key'
);
SET @sql_mid_key = IF(
  @has_mid_key = 0,
  'ALTER TABLE `payments` ADD COLUMN `midtrans_idempotency_key` CHAR(36) NULL AFTER `request_hash`',
  'SELECT 1'
);
PREPARE stmt_mid_key FROM @sql_mid_key;
EXECUTE stmt_mid_key;
DEALLOCATE PREPARE stmt_mid_key;

SET @has_old_idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'payments'
    AND index_name = 'uniq_payments_idempotency_key'
);
SET @sql_drop_idx = IF(
  @has_old_idx > 0,
  'ALTER TABLE `payments` DROP INDEX `uniq_payments_idempotency_key`',
  'SELECT 1'
);
PREPARE stmt_drop_idx FROM @sql_drop_idx;
EXECUTE stmt_drop_idx;
DEALLOCATE PREPARE stmt_drop_idx;

SET @has_new_idx = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'payments'
    AND index_name = 'uniq_payments_customer_idempotency'
);
SET @sql_add_idx = IF(
  @has_new_idx = 0,
  'ALTER TABLE `payments` ADD UNIQUE KEY `uniq_payments_customer_idempotency` (`customer_id`, `idempotency_key`)',
  'SELECT 1'
);
PREPARE stmt_add_idx FROM @sql_add_idx;
EXECUTE stmt_add_idx;
DEALLOCATE PREPARE stmt_add_idx;
