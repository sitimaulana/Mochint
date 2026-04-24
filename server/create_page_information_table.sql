-- Create page_information table for managing dynamic content
-- This table stores dynamic content for Home, About, and Promo pages

CREATE TABLE IF NOT EXISTS page_information (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_type ENUM('home', 'about', 'promo') NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content TEXT,
  image_url VARCHAR(500),
  additional_data JSON,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_page_section (page_type, section_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default data for Home page
INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, display_order) VALUES
('home', 'hero', 'Selamat Datang di Mochint Beauty Care', 'Klinik Kecantikan Terpercaya di Pandaan', 
 'Dapatkan perawatan kecantikan terbaik dengan teknologi modern dan terapis profesional. Wujudkan kulit impian Anda bersama kami.', 
 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80', 1),

('home', 'services', 'Layanan Kami', 'Perawatan Profesional untuk Kecantikan Anda', 
 'Kami menyediakan berbagai layanan perawatan kecantikan dengan teknologi terkini dan produk berkualitas tinggi.', 
 NULL, 2),

('home', 'why_choose', 'Kenapa Memilih Kami?', 'Alasan Menjadi Bagian dari Mochint Beauty Care', 
 'Kami berkomitmen memberikan pelayanan terbaik dengan tenaga profesional, produk berkualitas, dan hasil yang memuaskan.', 
 NULL, 3);

-- Insert default data for About page
INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, additional_data, display_order) VALUES
('about', 'story', 'Cerita Mochint Beauty Care', 'Perjalanan Kami Memberikan Layanan Terbaik', 
 'Selamat datang di Mochint Beauty Care, salon kecantikan yang berlokasi di Pandaan Pasuruan Jawa Timur. Kami hadir sebagai solusi bagi Anda yang ingin merawat kulit dengan teknologi terkini dan bahan premium.',
 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80', 
 NULL, 1),

('about', 'vision', 'Visi & Misi', 'Komitmen Kami untuk Anda', 
 'Menjadi pusat kecantikan terpercaya yang menghadirkan solusi perawatan kulit berkualitas tinggi dengan teknologi modern dan pelayanan profesional.',
 NULL,
 JSON_OBJECT(
   'visi', 'Menjadi klinik kecantikan terdepan di Indonesia',
   'misi', JSON_ARRAY(
     'Memberikan pelayanan terbaik dengan teknologi modern',
     'Menggunakan produk berkualitas tinggi dan aman',
     'Memberdayakan tim profesional dan bersertifikat',
     'Memberikan hasil yang memuaskan bagi setiap pelanggan'
   )
 ), 2);

-- Insert default data for Promo page
INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, additional_data, display_order) VALUES
('promo', 'main_promo', 'Diskon Reseller', '30% discount for selected products', 
 'Pelembab Moisturizer BPOM paling ampuh dan Halal MUI. Moisturizer Cream Pronafa Skincare merupakan perawatan hydrating intensif untuk menjaga kelembapan alami kulit. Mengandung Amino Ceramide, Aloe Vera, dan Sodium Hyaluronate, dikombinasikan dengan Copper Tripeptide yang dapat mempercepat pemulihan jaringan kulit Anda secara maksimal dan bercahaya.',
 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
 JSON_OBJECT(
   'discount_percentage', '30',
   'benefits', JSON_ARRAY('Facial Signature', 'Premium Masker', 'Skin Analysis', 'Hydrating Treatment', 'Aftercare Consultation'),
   'whatsapp_number', '6281234567890',
   'promo_label', 'Limited Offer'
 ), 1);

-- Create indexes for better performance
CREATE INDEX idx_page_type ON page_information(page_type);
CREATE INDEX idx_section_key ON page_information(section_key);
CREATE INDEX idx_is_active ON page_information(is_active);
CREATE INDEX idx_display_order ON page_information(display_order);
