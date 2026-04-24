const { promisePool } = require('./config/database');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up page_information table...\n');
    
    // Step 1: Create table
    console.log('📝 Creating table...');
    await promisePool.query(`
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
        UNIQUE KEY unique_page_section (page_type, section_key),
        INDEX idx_page_type (page_type),
        INDEX idx_section_key (section_key),
        INDEX idx_is_active (is_active),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table created successfully!\n');
    
    // Step 2: Check if data already exists
    const [existing] = await promisePool.query('SELECT COUNT(*) as count FROM page_information');
    if (existing[0].count > 0) {
      console.log(`ℹ️  Table already has ${existing[0].count} records. Skipping data insertion.`);
      process.exit(0);
    }
    
    // Step 3: Insert default data for Home page
    console.log('📝 Inserting Home page content...');
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, display_order) VALUES
      ('home', 'hero', 'Selamat Datang di Mochint Beauty Care', 'Klinik Kecantikan Terpercaya di Pandaan', 
       'Dapatkan perawatan kecantikan terbaik dengan teknologi modern dan terapis profesional. Wujudkan kulit impian Anda bersama kami.', 
       'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80', 1)
    `);
    
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, display_order) VALUES
      ('home', 'services', 'Layanan Kami', 'Perawatan Profesional untuk Kecantikan Anda', 
       'Kami menyediakan berbagai layanan perawatan kecantikan dengan teknologi terkini dan produk berkualitas tinggi.', 2)
    `);
    
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, display_order) VALUES
      ('home', 'why_choose', 'Kenapa Memilih Kami?', 'Alasan Menjadi Bagian dari Mochint Beauty Care', 
       'Kami berkomitmen memberikan pelayanan terbaik dengan tenaga profesional, produk berkualitas, dan hasil yang memuaskan.', 3)
    `);
    console.log('✅ Home page content inserted!\n');
    
    // Step 4: Insert default data for About page
    console.log('📝 Inserting About page content...');
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, display_order) VALUES
      ('about', 'story', 'Cerita Mochint Beauty Care', 'Perjalanan Kami Memberikan Layanan Terbaik', 
       'Selamat datang di Mochint Beauty Care, salon kecantikan yang berlokasi di Pandaan Pasuruan Jawa Timur. Kami hadir sebagai solusi bagi Anda yang ingin merawat kulit dengan teknologi terkini dan bahan premium.',
       'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80', 1)
    `);
    
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, additional_data, display_order) VALUES
      ('about', 'vision', 'Visi & Misi', 'Komitmen Kami untuk Anda', 
       'Menjadi pusat kecantikan terpercaya yang menghadirkan solusi perawatan kulit berkualitas tinggi dengan teknologi modern dan pelayanan profesional.',
       JSON_OBJECT(
         'visi', 'Menjadi klinik kecantikan terdepan di Indonesia',
         'misi', JSON_ARRAY(
           'Memberikan pelayanan terbaik dengan teknologi modern',
           'Menggunakan produk berkualitas tinggi dan aman',
           'Memberdayakan tim profesional dan bersertifikat',
           'Memberikan hasil yang memuaskan bagi setiap pelanggan'
         )
       ), 2)
    `);
    console.log('✅ About page content inserted!\n');
    
    // Step 5: Insert default data for Promo page
    console.log('📝 Inserting Promo page content...');
    await promisePool.query(`
      INSERT INTO page_information (page_type, section_key, title, subtitle, content, image_url, additional_data, display_order) VALUES
      ('promo', 'main_promo', 'Diskon Reseller', '30% discount for selected products', 
       'Pelembab Moisturizer BPOM paling ampuh dan Halal MUI. Moisturizer Cream Pronafa Skincare merupakan perawatan hydrating intensif untuk menjaga kelembapan alami kulit. Mengandung Amino Ceramide, Aloe Vera, dan Sodium Hyaluronate, dikombinasikan dengan Copper Tripeptide yang dapat mempercepat pemulihan jaringan kulit Anda secara maksimal dan bercahaya.',
       'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
       JSON_OBJECT(
         'discount_percentage', '30',
         'benefits', JSON_ARRAY('Facial Signature', 'Premium Masker', 'Skin Analysis', 'Hydrating Treatment', 'Aftercare Consultation'),
         'whatsapp_number', '6281234567890',
         'promo_label', 'Limited Offer'
       ), 1)
    `);
    console.log('✅ Promo page content inserted!\n');
    
    // Step 6: Verify
    const [result] = await promisePool.query('SELECT COUNT(*) as count FROM page_information');
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Total records in page_information table: ${result[0].count}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
}

setupDatabase();
