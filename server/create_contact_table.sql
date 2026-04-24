-- Create contact_information table
CREATE TABLE IF NOT EXISTS contact_information (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  maps_url TEXT,
  social_media JSON,
  operating_hours JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default contact information
INSERT INTO contact_information (
  phone, whatsapp, email, address, city, province, postal_code, maps_url, social_media, operating_hours
) VALUES (
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '{"instagram":"","facebook":"","twitter":"","tiktok":""}',
  '{"weekday":"","weekend":""}'
) ON DUPLICATE KEY UPDATE id=id;
