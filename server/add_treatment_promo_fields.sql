-- Add promo fields to treatments table

ALTER TABLE treatments 
ADD COLUMN discount_percentage INT DEFAULT 0 COMMENT 'Discount percentage (0-100)',
ADD COLUMN promo_start_date DATE DEFAULT NULL COMMENT 'Promo start date',
ADD COLUMN promo_end_date DATE DEFAULT NULL COMMENT 'Promo end date';

-- Update existing records with default values
UPDATE treatments 
SET discount_percentage = 0, 
    promo_start_date = NULL, 
    promo_end_date = NULL
WHERE discount_percentage IS NULL;
