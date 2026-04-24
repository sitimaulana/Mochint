-- Fix image_url column size for page_information table
-- Change from VARCHAR(500) to LONGTEXT to support base64 images

USE beauty_clinic;

-- Backup existing data (optional, for safety)
-- CREATE TABLE page_information_backup AS SELECT * FROM page_information;

-- Alter the image_url column to LONGTEXT
ALTER TABLE page_information 
MODIFY COLUMN image_url LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Verify the change
DESCRIBE page_information;

-- Show success message
SELECT 'image_url column successfully changed to LONGTEXT' AS Status;
