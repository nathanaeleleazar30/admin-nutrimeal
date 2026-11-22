-- ========================================================
-- Migration: 004_add_ai_planner_attributes_to_meals.sql
-- Description: Menambahkan atribut spicy_level, is_vegetarian, event_tags, dan stock_quantity
--              untuk mendukung fitur NutriMeal AI Planner (Optimization)
-- ========================================================

ALTER TABLE `meals`
  ADD COLUMN `spicy_level` ENUM('Tidak Pedas', 'Sedang', 'Pedas') NOT NULL DEFAULT 'Tidak Pedas' AFTER `tags`,
  ADD COLUMN `is_vegetarian` TINYINT(1) NOT NULL DEFAULT 0 AFTER `spicy_level`,
  ADD COLUMN `event_tags` VARCHAR(255) NOT NULL DEFAULT 'Rapat Kantor, Syukuran, Harian' AFTER `is_vegetarian`,
  ADD COLUMN `stock_quantity` INT NOT NULL DEFAULT 100 AFTER `is_available`;

-- Update sample existing data for realistic AI Planner recommendations
UPDATE `meals` SET `spicy_level` = 'Tidak Pedas', `is_vegetarian` = 0, `event_tags` = 'Rapat Kantor, Harian, Sehat', `stock_quantity` = 100 WHERE `id` = 'item-1';
UPDATE `meals` SET `spicy_level` = 'Sedang', `is_vegetarian` = 0, `event_tags` = 'Syukuran, Rapat Kantor, Tradisional', `stock_quantity` = 80 WHERE `id` = 'item-2';
UPDATE `meals` SET `spicy_level` = 'Tidak Pedas', `is_vegetarian` = 0, `event_tags` = 'Rapat Kantor, Workshop, Sehat', `stock_quantity` = 90 WHERE `id` = 'item-3';
UPDATE `meals` SET `spicy_level` = 'Sedang', `is_vegetarian` = 0, `event_tags` = 'Syukuran, Ulang Tahun, Mewah', `stock_quantity` = 60 WHERE `id` = 'item-4';
