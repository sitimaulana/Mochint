-- Create table for storing treatment categories and facilities options
CREATE TABLE IF NOT EXISTS treatment_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  option_type ENUM('category', 'facility') NOT NULL,
  option_value VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_option (option_type, option_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO treatment_options (option_type, option_value) VALUES
('category', 'Perawatan Wajah'),
('category', 'Perawatan Tubuh'),
('category', 'Perawatan Khusus'),
('category', 'Paket Spesial'),
('category', 'Perawatan Promo')
ON DUPLICATE KEY UPDATE option_value = option_value;

-- Insert default facilities
INSERT INTO treatment_options (option_type, option_value) VALUES
('facility', 'Facial Wash'),
('facility', 'Deep Cleansing'),
('facility', 'Facial Massage'),
('facility', 'Head Massage'),
('facility', 'Shoulder Massage'),
('facility', 'Masker Wajah'),
('facility', 'Scrub'),
('facility', 'Serum Treatment'),
('facility', 'Totok Wajah'),
('facility', 'Face Toning'),
('facility', 'Aromaterapi'),
('facility', 'Hand Treatment'),
('facility', 'Foot Spa')
ON DUPLICATE KEY UPDATE option_value = option_value;
