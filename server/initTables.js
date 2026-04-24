const bcrypt = require('bcryptjs');

const createAllTables = async (pool) => {
  try {
    const connection = await pool.getConnection();
    console.log('🔄 Creating/updating database tables...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('admin', 'staff') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        join_date VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id VARCHAR(20) UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        member_id INT,
        treatment VARCHAR(100) NOT NULL,
        therapist VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        amount DECIMAL(10, 2),
        status ENUM('confirmed', 'completed') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS treatments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        duration VARCHAR(20) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        status ENUM('Draft', 'Published') DEFAULT 'Published',
        author VARCHAR(100) DEFAULT 'Admin',
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed defaults
    const adminPassword = await bcrypt.hash('admin123', 10);
    const memberPassword = await bcrypt.hash('labubu', 10);

    await connection.query(`
      INSERT IGNORE INTO admin_users (username, email, password, full_name, role) 
      VALUES ('admin', 'admin@mochint.com', ?, 'Administrator', 'admin')
    `, [adminPassword]);

    await connection.query(`
      INSERT IGNORE INTO members (name, email, password, phone, address, join_date) 
      VALUES ('Siltiana Putri', 'siltiana@gmail.com', ?, '081234567890', 'Jl. Test No. 123, Jakarta', '2024-01-15')
    `, [memberPassword]);

    await connection.query(`
      INSERT IGNORE INTO therapists (name, email, phone) 
      VALUES ('Dr. Amelia', 'amelia@clinic.com', '0811111111'),
             ('Dr. Budi', 'budi@clinic.com', '0812222222')
    `);

    await connection.query(`
      INSERT IGNORE INTO treatments (name, category, duration, price, description) 
      VALUES ('Facial Treatment', 'Facial', '60 minutes', 300000, 'Deep cleansing facial treatment'),
             ('Body Massage', 'Massage', '90 minutes', 450000, 'Relaxing full body massage')
    `);

    await connection.query(`
      INSERT IGNORE INTO products (name, category, price, description) 
      VALUES ('Vitamin C Serum', 'Skincare', 250000, 'Brightening serum with Vitamin C'),
             ('Moisturizing Cream', 'Skincare', 180000, 'Deep hydration cream')
    `);

    await connection.query(`
      INSERT IGNORE INTO articles (title, content, category, status, author) 
      VALUES ('Tips Perawatan Kulit Sehat', 'Content artikel tentang perawatan kulit...', 'Beauty', 'Published', 'Admin'),
             ('Manfaat Facial Rutin', 'Content artikel tentang manfaat facial...', 'Treatment', 'Published', 'Admin')
    `);

    connection.release();
    console.log('✅ All tables created with sample data');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

module.exports = createAllTables;