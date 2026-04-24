-- Migration untuk menambahkan field promo pada tabel products
-- Jalankan query ini di database beauty_clinic

-- Tambahkan kolom untuk fitur promo
ALTER TABLE `products` 
ADD COLUMN `discount_percentage` INT DEFAULT 0 COMMENT 'Persentase diskon (0-100)',
ADD COLUMN `promo_start_date` DATE DEFAULT NULL COMMENT 'Tanggal mulai promo',
ADD COLUMN `promo_end_date` DATE DEFAULT NULL COMMENT 'Tanggal akhir promo';

-- Update existing products dengan nilai default
UPDATE `products` SET 
    `discount_percentage` = 0,
    `promo_start_date` = NULL,
    `promo_end_date` = NULL
WHERE `discount_percentage` IS NULL;
