-- Add facilities field to treatments table

ALTER TABLE treatments 
ADD COLUMN facilities TEXT DEFAULT NULL COMMENT 'JSON array of treatment facilities';

-- Update existing records with empty array
UPDATE treatments 
SET facilities = '[]'
WHERE facilities IS NULL;
