const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================
// MIDDLEWARE
// ============================

// Untuk development, allow semua origin
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================
// DATABASE CONFIGURATION
// ============================

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_clinic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// ============================
// CREATE ALL TABLES (SIMPLE)
// ============================

const createAllTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    console.log('\n🔄 Creating/updating database tables...');
    
    // ADMIN_USERS TABLE
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

    // MEMBERS TABLE
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

    // APPOINTMENTS TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id VARCHAR(20) UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        customer_id INT,
        treatment VARCHAR(100) NOT NULL,
        therapist VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        amount DECIMAL(10, 2),
        status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // THERAPISTS TABLE
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

    // TREATMENTS TABLE
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

    // PRODUCTS TABLE
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

    // ARTICLES TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        status ENUM('Draft', 'Published') DEFAULT 'Published',
        author VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // CREATE DEFAULT DATA
    const adminPassword = await bcrypt.hash('admin123', 10);
    const memberPassword = await bcrypt.hash('labubu', 10);
    
    // Insert default admin
    await connection.query(`
      INSERT IGNORE INTO admin_users (username, email, password, full_name, role) 
      VALUES ('admin', 'admin@mochint.com', ?, 'Administrator', 'admin')
    `, [adminPassword]);
    
    // Insert default member
    await connection.query(`
      INSERT IGNORE INTO members (name, email, password, phone, address, join_date) 
      VALUES ('Siltiana Putri', 'siltiana@gmail.com', ?, '081234567890', 'Jl. Test No. 123, Jakarta', '2024-01-15')
    `, [memberPassword]);
    
    // Insert sample data jika tabel kosong
    await connection.query(`
      INSERT IGNORE INTO therapists (name, email, phone) 
      VALUES 
      ('Dr. Amelia', 'amelia@clinic.com', '0811111111'),
      ('Dr. Budi', 'budi@clinic.com', '0812222222')
    `);
    
    await connection.query(`
      INSERT IGNORE INTO treatments (name, category, duration, price, description) 
      VALUES 
      ('Facial Treatment', 'Facial', '60 minutes', 300000, 'Deep cleansing facial treatment'),
      ('Body Massage', 'Massage', '90 minutes', 450000, 'Relaxing full body massage')
    `);
    
    await connection.query(`
      INSERT IGNORE INTO products (name, category, price, description) 
      VALUES 
      ('Vitamin C Serum', 'Skincare', 250000, 'Brightening serum with Vitamin C'),
      ('Moisturizing Cream', 'Skincare', 180000, 'Deep hydration cream')
    `);
    
    await connection.query(`
      INSERT IGNORE INTO articles (title, content, category, status, author) 
      VALUES 
      ('Tips Perawatan Kulit Sehat', 'Content artikel tentang perawatan kulit...', 'Beauty', 'Published', 'Admin'),
      ('Manfaat Facial Rutin', 'Content artikel tentang manfaat facial...', 'Treatment', 'Published', 'Admin')
    `);
    
    connection.release();
    console.log('✅ All tables created with sample data');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

createAllTables();

// ============================
// AUTHENTICATION MIDDLEWARE (SIMPLE)
// ============================

const authenticateToken = (req, res, next) => {
  // Public endpoints tidak butuh token
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/treatments',
    '/api/products', 
    '/api/therapists',
    '/api/articles',
    '/api/reviews'
  ];
  
  if (publicEndpoints.includes(req.path)) {
    return next();
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'mochint_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ============================
// PUBLIC API ENDPOINTS (RETURN ARRAYS DIRECTLY)
// ============================

// 1. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check admin
    const [adminRows] = await pool.query(
      'SELECT id, username, email, password, role FROM admin_users WHERE email = ?',
      [normalizedEmail]
    );
    
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      const validPass = await bcrypt.compare(password, admin.password);
      
      if (!validPass) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      }
      
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          user_type: 'admin',
          role: admin.role 
        },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          user_type: 'admin'
        }
      });
    }
    
    // Check member
    const [memberRows] = await pool.query(
      'SELECT id, name, email, password FROM members WHERE email = ?',
      [normalizedEmail]
    );
    
    if (memberRows.length > 0) {
      const member = memberRows[0];
      const validPass = await bcrypt.compare(password, member.password);
      
      if (!validPass) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      }
      
      const token = jwt.sign(
        { 
          id: member.id, 
          email: member.email, 
          user_type: 'member'
        },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: member.id,
          name: member.name,
          email: member.email,
          user_type: 'member'
        }
      });
    }
    
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// 2. TREATMENTS - Return array directly
app.get('/api/treatments', async (req, res) => {
  try {
    const [treatments] = await pool.query('SELECT * FROM treatments ORDER BY created_at DESC');
    res.json(treatments); // LANGSUNG ARRAY
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]); // Return empty array on error
  }
});

// 3. PRODUCTS - Return array directly
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 6');
    res.json(rows); // LANGSUNG ARRAY
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});

// 4. THERAPISTS - Return array directly
app.get('/api/therapists', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM therapists WHERE status = "active" ORDER BY created_at DESC'
    );
    res.json(rows); // LANGSUNG ARRAY
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});

// 5. ARTICLES - Return array directly
app.get('/api/articles', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE status = "Published" ORDER BY created_at DESC'
    );
    res.json(rows); 
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});


app.get('/api/articles/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE id = ? AND status = "Published" LIMIT 1',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});

// 6. REVIEWS - New endpoint (Return array directly)
app.get('/api/reviews', async (req, res) => {
  try {
    // Coba ambil data dari database
    const [rows] = await pool.query(`
      SELECT 
        'Sari' as customer_name,
        5 as rating,
        'Pelayanan sangat memuaskan!' as comment,
        'Facial Treatment' as treatment
      UNION ALL
      SELECT 
        'Rina' as customer_name,
        4 as rating,
        'Terapisnya ramah dan profesional' as comment,
        'Body Massage' as treatment
    `);
    
    res.json(rows); // LANGSUNG ARRAY
  } catch (error) {
    console.error('Error:', error);
    // Return dummy data
    res.json([
      { 
        customer_name: 'Sari', 
        rating: 5, 
        comment: 'Pelayanan sangat memuaskan!', 
        treatment: 'Facial Treatment' 
      },
      { 
        customer_name: 'Rina', 
        rating: 4, 
        comment: 'Terapisnya ramah dan profesional', 
        treatment: 'Body Massage' 
      }
    ]);
  }
});

// ============================
// PROTECTED API ENDPOINTS (NEED TOKEN)
// ============================

// 7. MEMBERS - Return array directly
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user?.user_type === 'admin';
    
    if (isAdmin) {
      const [rows] = await pool.query('SELECT id, name, email, phone, address, join_date FROM members ORDER BY created_at DESC');
      res.json(rows); // LANGSUNG ARRAY
    } else {
      const [rows] = await pool.query(
        'SELECT id, name, email, phone, address, join_date FROM members WHERE id = ?', 
        [req.user.id]
      );
      res.json(rows); // LANGSUNG ARRAY
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});

// 8. APPOINTMENTS - Return array directly
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user?.user_type === 'admin';
    
    if (isAdmin) {
      const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
      res.json(rows); // LANGSUNG ARRAY
    } else {
      const [rows] = await pool.query(
        'SELECT * FROM appointments WHERE customer_id = ? ORDER BY date DESC, time DESC',
        [req.user.id]
      );
      res.json(rows); // LANGSUNG ARRAY
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json([]);
  }
});

// 9. CREATE APPOINTMENT
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { customer_name, treatment, therapist, date, time, amount } = req.body;
    
    if (!customer_name || !treatment || !therapist || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        error: 'Required fields missing' 
      });
    }
    
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const appointmentId = `APT${String(countResult[0].count + 1).padStart(5, '0')}`;
    
    const [result] = await pool.query(
      `INSERT INTO appointments (appointment_id, customer_name, customer_id, treatment, therapist, date, time, amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        customer_name,
        req.user.id,
        treatment,
        therapist,
        date,
        time,
        amount || 0
      ]
    );
    
    const [newAppointment] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    
    res.json({
      success: true,
      data: newAppointment[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create appointment' 
    });
  }
});

// 10. ADMIN DASHBOARD (Return object untuk dashboard)
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const isAdmin = req.user?.user_type === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }
    
    const [totalMembers] = await pool.query('SELECT COUNT(*) as count FROM members');
    const [totalAppointments] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const [todayAppointments] = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE DATE(date) = CURDATE()');
    const [pendingAppointments] = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE status = "pending"');
    
    const stats = {
      total_members: totalMembers[0].count || 0,
      total_appointments: totalAppointments[0].count || 0,
      today_appointments: todayAppointments[0].count || 0,
      pending_appointments: pendingAppointments[0].count || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

// ============================
// BASIC ROUTES
// ============================

app.get('/', (req, res) => {
  res.json({ 
    message: 'Mochint Beauty Clinic API - FIXED VERSION',
    version: '1.0',
    note: 'Public endpoints return arrays directly'
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'connected' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected' 
    });
  }
});

// ============================
// START SERVER
// ============================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 MOCHINT BEAUTY CLINIC API - FIXED VERSION');
  console.log('='.repeat(70));
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`✅ Public endpoints return ARRAYS directly`);
  console.log(`✅ Added /api/reviews endpoint`);
  console.log(`\n🔑 Test Login Credentials:`);
  console.log(`   👑 Admin:    admin@mochint.com / admin123`);
  console.log(`   👤 Member:   siltiana@gmail.com / labubu`);
  console.log('\n📊 Public Endpoints (no token needed):');
  console.log(`   GET http://localhost:${PORT}/api/treatments`);
  console.log(`   GET http://localhost:${PORT}/api/products`);
  console.log(`   GET http://localhost:${PORT}/api/therapists`);
  console.log(`   GET http://localhost:${PORT}/api/articles`);
  console.log(`   GET http://localhost:${PORT}/api/reviews (NEW!)`);
  console.log('\n🔒 Protected Endpoints (need token):');
  console.log(`   GET http://localhost:${PORT}/api/members`);
  console.log(`   GET http://localhost:${PORT}/api/appointments`);
  console.log(`   GET http://localhost:${PORT}/api/admin/dashboard`);
  console.log('\n✅ Frontend should work without any changes!');
  console.log('='.repeat(70));
});