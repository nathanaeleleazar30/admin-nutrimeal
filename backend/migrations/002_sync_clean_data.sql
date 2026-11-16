-- ==============================================================================
-- Migration 002: Sync Clean Data
-- Membersihkan data dummy (orders, vouchers, faqs, dummy customers)
-- Menyinkronkan meals (8 menu), packages (4 paket), admins, akun user riil,
-- dan langganan aktif user riil (nael & Raihan).
-- ==============================================================================

-- 1. Bersihkan tabel dummy yang dikosongkan
DELETE FROM `orders`;
DELETE FROM `vouchers`;
DELETE FROM `faqs`;

-- 2. Hapus langganan dummy lama
DELETE FROM `subscriptions` WHERE `id` NOT IN ('sub-nael', 'sub-raihan');

-- 3. Hapus customer dummy lama
DELETE FROM `customers` WHERE `id` IN ('cst-1', 'cst-2', 'cst-3', 'cst-4', 'cst-5');

-- 4. Sinkronisasi Data Admins
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
('adm-1', 'Nathanael', 'nathanael@nutrimeal.id', 'nathanael123', 'superadmin'),
('adm-2', 'Siti Saroh', 'siti.admin@nutrimeal.id', 'admin123', 'admin'),
('adm-1791733107152', 'Admin Test', 'admin.test@nutrimeal.id', 'Test1234', 'admin')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`);

-- 5. Sinkronisasi Data Customers Riil
INSERT INTO `customers` (
  `id`, `name`, `email`, `password`, `google_id`, `avatar_url`, `phone`, `address`, `type`, `company_name`,
  `total_orders`, `total_spent`, `active_subscription`, `allergies`, `dietary_goals`, `target_calories`, `joined_date`
) VALUES
('cst-1791709332848', 'Test User Google', 'test_google@student.ub.ac.id', NULL, NULL, NULL, '', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-11'),
('cst-1791710995015', 'Tes User', 'test_auto_1791710994952@gmail.com', 'Password123', NULL, NULL, '08123456789', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-11'),
('cst-1791732947116', 'Budi Test', 'budi.test@gmail.com', 'Password123', NULL, NULL, '081299988877', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-11'),
('cst-1791734190821', 'bintang', 'bintangfatahillah12@gmail.com', 'bintang12', NULL, NULL, '87797669180', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-11'),
('cst-1792168615665', 'jmbd', 'jmbd@gmail.com', 'jmbd1234', NULL, NULL, '83869991137', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-16'),
('cst-1792338797831', 'bintang cuki', 'bintangjemjem2@gmail.com', 'bintang12', '111815352387836783187', 'https://lh3.googleusercontent.com/a/ACg8ocJvpR47lYxMaiFWqVpihmc4_9H_bMiEcmLa-3SZg0XMRM51OkBk=s96-c', '812319194987', '', 'Personal', NULL, 0, 0, NULL, '', '', 1800, '2026-10-18'),
('cst-1792473012910', 'nael', 'nael@gmail.com', 'nael1234', NULL, NULL, '8316194848', '', 'Personal', NULL, 0, 0, 'Paket Bulanan Lengkap', '', '', 1800, '2026-10-20'),
('cst-1794419849764', 'Raihan', 'tugasraihan.69@gmail.com', 'Hahaha01', NULL, NULL, '85745496617', '', 'Personal', NULL, 0, 0, 'Paket Bulanan Lengkap', '', '', 1800, '2026-11-11')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `google_id` = VALUES(`google_id`),
  `avatar_url` = VALUES(`avatar_url`),
  `phone` = VALUES(`phone`),
  `address` = VALUES(`address`),
  `type` = VALUES(`type`),
  `company_name` = VALUES(`company_name`),
  `total_orders` = VALUES(`total_orders`),
  `total_spent` = VALUES(`total_spent`),
  `active_subscription` = VALUES(`active_subscription`),
  `allergies` = VALUES(`allergies`),
  `dietary_goals` = VALUES(`dietary_goals`),
  `target_calories` = VALUES(`target_calories`);

-- 6. Sinkronisasi Data Meals (8 Menu)
INSERT INTO `meals` (
  `id`, `name`, `category`, `calories`, `price`, `discount_percent`, `image_url`,
  `description`, `tags`, `schedule`, `delivery_time`, `protein`, `fat`, `carbs`, `is_available`
) VALUES
('item-1', 'Grilled Chicken Salad', 'Ayam', 450, 20000, 20, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop', 'Juicy Grilled Chicken, Grilled potato, Fresh Broccoli, seasoning parmesan Cheese', 'Dada Ayam Panggang, Brokoli Kukus, Parmesan Cheese', 'Setiap Hari Senin', '12:00 - 13:00 WIB', '35g', '12g', '55g', 1),
('item-1792338896242', 'bintang lumajang', 'Seafood', 450, 1, 0, '/uploads/meal-WhatsApp-Image-2026--1792338882641-5091.jpeg', 'halo kak ', '', 'Setiap Hari', '12:00 - 13:00 WIB', '35g', '12g', '45g', 1),
('item-1792474176533', 'hammad madiun', 'Roti', 450, 30000, 0, '/uploads/meal-WhatsApp-Image-2026--1792474163280-1835.jpeg', 'Menu katering sehat bergizi', '', 'Setiap Hari', '12:00 - 13:00 WIB', '35g', '12g', '45g', 1),
('item-2', 'Pepes Tongkol Rempah', 'Ikan', 380, 45000, 0, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop', 'Pepes ikan tongkol bumbu rempah kuning kaya antioksidan dan omega-3 disajikan hangat.', 'Ikan Tongkol Segar, Kemangi, Kunyit, Nasi Merah', 'Setiap Hari Selasa', '12:00 - 13:00 WIB', '38g', '10g', '30g', 1),
('item-3', 'Fresh Chicken Salad', 'Ayam', 320, 30000, 0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', 'Fresh green salad dengan irisan dada ayam bakar lembut, tomat ceri, dan dressing zaitun.', 'Dada Ayam, Romaine Lettuce, Tomat Ceri, Olive Oil', 'Setiap Hari Rabu', '12:00 - 13:00 WIB', '32g', '8g', '22g', 1),
('item-4', 'Lean Beef Veggie', 'Daging', 520, 40000, 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop', 'Tumis daging sapi lada hitam rendah lemak dipadu paprika renyah dan brokoli segar.', 'Daging Sapi Lean, Paprika, Brokoli, Bawang Bombay', 'Setiap Hari Kamis', '12:00 - 13:00 WIB', '42g', '15g', '40g', 1),
('item-5', 'Nutri Ayam Bowl', 'Ayam', 520, 28000, 0, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop', 'Healthy poke bowl dengan suwiran ayam gurih, jagung manis, kubis ungu, dan edamame segar.', 'Suwir Ayam, Jagung Manis, Kubis Ungu, Edamame', 'Setiap Hari Jumat', '12:00 - 13:00 WIB', '36g', '14g', '58g', 1),
('item-6', 'Spinach Chicken Wrap', 'Roti', 350, 28000, 0, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop', 'Tortilla bayam lembut membungkus ayam panggang, selada renyah, dan saus yoghurt herbs.', 'Tortilla Bayam, Ayam Panggang, Selada, Yoghurt', 'Setiap Hari Sabtu', '12:00 - 13:00 WIB', '28g', '11g', '38g', 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `calories` = VALUES(`calories`),
  `price` = VALUES(`price`),
  `discount_percent` = VALUES(`discount_percent`),
  `image_url` = VALUES(`image_url`),
  `description` = VALUES(`description`),
  `tags` = VALUES(`tags`),
  `schedule` = VALUES(`schedule`),
  `delivery_time` = VALUES(`delivery_time`),
  `protein` = VALUES(`protein`),
  `fat` = VALUES(`fat`),
  `carbs` = VALUES(`carbs`),
  `is_available` = VALUES(`is_available`);

-- 7. Sinkronisasi Data Packages (4 Paket)
INSERT INTO `packages` (
  `id`, `name`, `type`, `description`, `price`, `portions`, `target_audience`,
  `sales_count`, `percentage`, `color`, `included_meals`
) VALUES
('pkg-1', 'Paket Sehat Diet Mingguan', 'Mingguan', 'Paket makanan sehat defisit kalori seimbang dengan kontrol karbohidrat dan protein tinggi.', 350000, '10 Porsi (Makan Siang & Malam)', 'Personal', 600, 42, '#059669', 'Grilled Chicken, Chicken Salad, Pepes Tongkol'),
('pkg-2', 'Paket Makan Siang Kantor', 'Harian', 'Solusi makan siang bergizi untuk tim perusahaan dengan porsi pas dan higienis.', 525000, '15 Box Prasmanan Mini', 'Korporat / Kantor', 443, 31, '#0284c7', 'Lean Beef Veggie, Chicken Wrap, Grilled Chicken'),
('pkg-3', 'Paket Family Sehat 5 Hari', 'Mingguan', 'Menu variatif lengkap lauk pauk tinggi serat untuk seluruh anggota keluarga.', 680000, '20 Porsi Keluarga', 'Keluarga', 257, 18, '#d97706', 'Pepes Tongkol, Ayam Bowl, Fresh Chicken Salad'),
('pkg-4', 'Prasmanan Rapat & Event', 'Prasmanan / Event', 'Layanan prasmanan sehat premium untuk meeting, seminar, dan acara kantor.', 1250000, '25 Porsi Prasmanan', 'Korporat / Kantor', 128, 9, '#dc2626', 'Lean Beef Veggie, Grilled Chicken Salad, Nutri Ayam Bowl')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `type` = VALUES(`type`),
  `description` = VALUES(`description`),
  `price` = VALUES(`price`),
  `portions` = VALUES(`portions`),
  `target_audience` = VALUES(`target_audience`),
  `sales_count` = VALUES(`sales_count`),
  `percentage` = VALUES(`percentage`),
  `color` = VALUES(`color`),
  `included_meals` = VALUES(`included_meals`);

-- 8. Sinkronisasi Subscriptions Riil
INSERT INTO `subscriptions` (
  `id`, `customer_id`, `customer_name`, `customer_phone`, `package_name`,
  `meal_slot`, `delivery_time_slot`, `start_date`, `end_date`, `days_remaining`,
  `total_days`, `status`, `pause_reason`, `auto_renew`, `address`
) VALUES
('sub-nael', 'cst-1792473012910', 'nael', '08316194848', 'Paket Bulanan Lengkap', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-11-01', '2026-11-30', 20, 30, 'Aktif', NULL, 1, 'Jl. Candi Mendut No. 5, Malang'),
('sub-raihan', 'cst-1794419849764', 'Raihan', '085745496617', 'Paket Bulanan Lengkap', 'Siang & Malam', '11.30 – 13.00 WIB (Slot Utama)', '2026-11-01', '2026-11-30', 20, 30, 'Aktif', NULL, 1, 'Jl. Sukarno Hatta No. 10, Malang')
ON DUPLICATE KEY UPDATE
  `customer_id` = VALUES(`customer_id`),
  `customer_name` = VALUES(`customer_name`),
  `customer_phone` = VALUES(`customer_phone`),
  `package_name` = VALUES(`package_name`),
  `meal_slot` = VALUES(`meal_slot`),
  `delivery_time_slot` = VALUES(`delivery_time_slot`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `days_remaining` = VALUES(`days_remaining`),
  `total_days` = VALUES(`total_days`),
  `status` = VALUES(`status`),
  `pause_reason` = VALUES(`pause_reason`),
  `auto_renew` = VALUES(`auto_renew`),
  `address` = VALUES(`address`);
