const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_clinic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create articles table if not exists

// ============================
// MEMBERS API ROUTES
// ============================

// Create members table if not exists
// ============================
// TREATMENTS API ROUTES
// ============================

// Create treatments table if not exists
// ============================
// THERAPISTS API ROUTES
// ============================

// Create therapists table if not exists
// Create appointments table if not exists
const createAppointmentsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        appointment_id VARCHAR(20) UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        customer_id INT,
        treatment VARCHAR(100) NOT NULL,
        therapist VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        duration VARCHAR(20),
        amount DECIMAL(10, 2),
        status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_date (date),
        INDEX idx_therapist (therapist),
        INDEX idx_customer_id (customer_id),
        FOREIGN KEY (customer_id) REFERENCES members(id) ON DELETE SET NULL
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Appointments table ready');
  } catch (error) {
    console.error('❌ Error creating appointments table:', error);
  }
};

createAppointmentsTable();


const createTherapistsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS therapists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        specialization VARCHAR(100),
        experience_years INT DEFAULT 0,
        status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
        working_hours VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_name (name),
        INDEX idx_email (email)
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Appointments table ready');
  } catch (error) {
    console.error('❌ Error creating appointments table:', error);
  }
};

createAppointmentsTable();

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const {
      customer_name,
      customer_id,
      treatment,
      therapist,
      date,
      time,
      amount,
      status,
      notes
    } = req.body;

    if (!customer_name || !treatment || !therapist || !date || !time) {
      return res.status(400).json({
        error: 'Customer name, treatment, therapist, date, and time are required'
      });
    }

    // Generate appointment ID
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const count = countResult[0].count;
    const appointmentId = `APT${String(count + 1).padStart(5, '0')}`;

    const [result] = await pool.query(
      `INSERT INTO appointments 
       (appointment_id, customer_name, customer_id, treatment, therapist, date, time, amount, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        customer_name.trim(),
        customer_id || null,
        treatment.trim(),
        therapist.trim(),
        date,
        time,
        parseFloat(amount) || 0,
        status || 'pending',
        notes?.trim() || ''
      ]
    );

    // Get the newly created appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT update appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_id,
      treatment,
      therapist,
      date,
      time,
      amount,
      status,
      notes
    } = req.body;

    // Check if appointment exists
    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await pool.query(
      `UPDATE appointments 
       SET customer_name = ?, customer_id = ?, treatment = ?, therapist = ?, 
           date = ?, time = ?, amount = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        customer_name || existing[0].customer_name,
        customer_id !== undefined ? customer_id : existing[0].customer_id,
        treatment || existing[0].treatment,
        therapist || existing[0].therapist,
        date || existing[0].date,
        time || existing[0].time,
        amount !== undefined ? parseFloat(amount) : existing[0].amount,
        status || existing[0].status,
        notes !== undefined ? notes : existing[0].notes,
        id
      ]
    );

    // Get updated appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// PATCH update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Check if appointment exists
    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

    // Get updated appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// FIX: Update all empty status to 'pending'
app.get('/api/appointments/fix-status', async (req, res) => {
  try {
    // Update all appointments with empty or null status to 'pending'
    const [result] = await pool.query(
      "UPDATE appointments SET status = 'pending' WHERE status = '' OR status IS NULL"
    );

    res.json({
      success: true,
      message: `Updated ${result.affectedRows} appointments to 'pending' status`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error fixing status:', error);
    res.status(500).json({ error: 'Failed to fix appointment status' });
  }
});

createTherapistsTable();

// GET all therapists
app.get('/api/therapists', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapists ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// GET single therapist by ID
app.get('/api/therapists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching therapist:', error);
    res.status(500).json({ error: 'Failed to fetch therapist' });
  }
});

// POST create new therapist
app.post('/api/therapists', async (req, res) => {
  try {
    const { name, email, phone, specialization, experience_years, status, working_hours } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Generate therapist ID
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM therapists');
    const count = countResult[0].count;
    const therapistId = `TH${String(count + 1).padStart(3, '0')}`;

    const [result] = await pool.query(
      `INSERT INTO therapists (id, name, email, phone, specialization, experience_years, status, working_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        therapistId,
        name.trim(),
        email.trim(),
        phone || null,
        specialization || null,
        parseInt(experience_years) || 0,
        status || 'active',
        working_hours || null
      ]
    );

    // Get the newly created therapist
    const [rows] = await pool.query('SELECT * FROM therapists WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating therapist:', error);
    res.status(500).json({ error: 'Failed to create therapist' });
  }
});

// PUT update therapist
app.put('/api/therapists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, specialization, experience_years, status, working_hours } = req.body;

    // Check if therapist exists
    const [existing] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    await pool.query(
      `UPDATE therapists 
       SET name = ?, email = ?, phone = ?, specialization = ?, experience_years = ?, status = ?, working_hours = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        email || existing[0].email,
        phone !== undefined ? phone : existing[0].phone,
        specialization !== undefined ? specialization : existing[0].specialization,
        experience_years !== undefined ? parseInt(experience_years) : existing[0].experience_years,
        status || existing[0].status,
        working_hours !== undefined ? working_hours : existing[0].working_hours,
        id
      ]
    );

    // Get updated therapist
    const [rows] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating therapist:', error);
    res.status(500).json({ error: 'Failed to update therapist' });
  }
});

// DELETE therapist
app.delete('/api/therapists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if therapist exists
    const [existing] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    await pool.query('DELETE FROM therapists WHERE id = ?', [id]);

    res.json({ message: 'Therapist deleted successfully' });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    res.status(500).json({ error: 'Failed to delete therapist' });
  }
});

// GET therapist statistics
app.get('/api/therapists/stats', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM therapists');
    const [active] = await pool.query('SELECT COUNT(*) as count FROM therapists WHERE status = "active"');
    const [totalTreatments] = await pool.query('SELECT SUM(total_treatments) as sum FROM therapists');

    // Calculate new therapists this month
    const [newThisMonth] = await pool.query(`
      SELECT COUNT(*) as count FROM therapists 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    res.json({
      total: total[0].count || 0,
      active: active[0].count || 0,
      totalTreatments: totalTreatments[0].sum || 0,
      newThisMonth: newThisMonth[0].count || 0
    });
  } catch (error) {
    console.error('Error fetching therapist stats:', error);
    res.status(500).json({ error: 'Failed to fetch therapist statistics' });
  }
});

// GET therapist's appointments (treatment history)
app.get('/api/therapists/:id/appointments', async (req, res) => {
  try {
    const { id } = req.params;

    // Get therapist name
    const [therapistRows] = await pool.query('SELECT name FROM therapists WHERE id = ?', [id]);

    if (therapistRows.length === 0) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    const therapistName = therapistRows[0].name;

    // Get appointments for this therapist (from appointments table if exists, or from member_history)
    let appointments = [];

    try {
      // Try to get from appointments table if it exists
      const [appointmentRows] = await pool.query(
        `SELECT * FROM appointments 
         WHERE therapist = ? AND status = 'completed'
         ORDER BY date DESC`,
        [therapistName]
      );
      appointments = appointmentRows;
    } catch (error) {
      // Fallback to member_history table
      const [historyRows] = await pool.query(
        `SELECT * FROM member_history 
         WHERE therapist = ?
         ORDER BY date DESC`,
        [therapistName]
      );

      appointments = historyRows.map(row => ({
        id: row.id,
        customer: row.member_id ? `Member ${row.member_id}` : 'Unknown',
        treatment: row.treatment_name,
        therapist: row.therapist,
        amount: row.amount,
        date: row.date,
        status: 'completed'
      }));
    }

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    res.status(500).json({ error: 'Failed to fetch therapist appointments' });
  }
});


const createProductsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image LONGTEXT,
        marketplace_links JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_price (price)
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Products table ready');
  } catch (error) {
    console.error('❌ Error creating products table:', error);
  }
};

createProductsTable();

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');

    // Parse JSON marketplace_links
    const formattedRows = rows.map(row => ({
      ...row,
      marketplaceLinks: row.marketplace_links ? JSON.parse(row.marketplace_links) : {}
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = rows[0];
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : {};

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, description, image, marketplaceLinks } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const priceNumber = parseFloat(price) || 0;
    const marketplaceLinksJSON = marketplaceLinks ? JSON.stringify(marketplaceLinks) : null;

    const [result] = await pool.query(
      `INSERT INTO products (name, category, price, description, image, marketplace_links) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category,
        priceNumber,
        description?.trim() || '',
        image || null,
        marketplaceLinksJSON
      ]
    );

    // Get the newly created product
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    const product = rows[0];
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : {};

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image, marketplaceLinks } = req.body;

    // Check if product exists
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const priceNumber = price !== undefined ? parseFloat(price) : existing[0].price;
    const marketplaceLinksJSON = marketplaceLinks !== undefined
      ? JSON.stringify(marketplaceLinks)
      : existing[0].marketplace_links;

    await pool.query(
      `UPDATE products 
       SET name = ?, category = ?, price = ?, description = ?, image = ?, marketplace_links = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        category || existing[0].category,
        priceNumber,
        description !== undefined ? description : existing[0].description,
        image !== undefined ? image : existing[0].image,
        marketplaceLinksJSON,
        id
      ]
    );

    // Get updated product
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    const product = rows[0];
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : {};

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category = ? ORDER BY price ASC',
      [category]
    );

    // Parse JSON marketplace_links
    const formattedRows = rows.map(row => ({
      ...row,
      marketplaceLinks: row.marketplace_links ? JSON.parse(row.marketplace_links) : {}
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


const createTreatmentsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS treatments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        duration VARCHAR(20) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_price (price)
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Treatments table ready');
  } catch (error) {
    console.error('❌ Error creating treatments table:', error);
  }
};

createTreatmentsTable();

// GET all treatments
app.get('/api/treatments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM treatments ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// GET single treatment by ID
app.get('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ error: 'Failed to fetch treatment' });
  }
});

// POST create new treatment
app.post('/api/treatments', async (req, res) => {
  try {
    const { name, category, duration, price, description, image } = req.body;

    if (!name || !category || !duration || !price) {
      return res.status(400).json({ error: 'Name, category, duration, and price are required' });
    }

    const priceNumber = parseFloat(price) || 0;

    const [result] = await pool.query(
      `INSERT INTO treatments (name, category, duration, price, description, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category,
        duration,
        priceNumber,
        description?.trim() || '',
        image || null
      ]
    );

    // Get the newly created treatment
    const [rows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

// PUT update treatment
app.put('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, duration, price, description, image } = req.body;

    // Check if treatment exists
    const [existing] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    const priceNumber = price !== undefined ? parseFloat(price) : existing[0].price;

    await pool.query(
      `UPDATE treatments 
       SET name = ?, category = ?, duration = ?, price = ?, description = ?, image = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        category || existing[0].category,
        duration || existing[0].duration,
        priceNumber,
        description !== undefined ? description : existing[0].description,
        image !== undefined ? image : existing[0].image,
        id
      ]
    );

    // Get updated treatment
    const [rows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

// DELETE treatment
app.delete('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if treatment exists
    const [existing] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    await pool.query('DELETE FROM treatments WHERE id = ?', [id]);

    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    res.status(500).json({ error: 'Failed to delete treatment' });
  }
});

// GET treatments by category
app.get('/api/treatments/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM treatments WHERE category = ? ORDER BY price ASC',
      [category]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching treatments by category:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});


const createMembersTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        join_date VARCHAR(20),
        total_visits INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        last_visit VARCHAR(50) DEFAULT 'Never',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_name (name)
      )
    `;
    await connection.query(sql);

    // Create member_history table for treatment records
    const historySql = `
      CREATE TABLE IF NOT EXISTS member_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        member_id INT NOT NULL,
        date VARCHAR(20),
        treatment_name VARCHAR(100),
        therapist VARCHAR(50),
        amount DECIMAL(10, 2),
        appointment_id VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
        INDEX idx_member_id (member_id),
        INDEX idx_date (date)
      )
    `;
    await connection.query(historySql);

    connection.release();
    console.log('✅ Members and history tables ready');
  } catch (error) {
    console.error('❌ Error creating members table:', error);
  }
};

createMembersTable();

// GET all members
app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *, 
      (SELECT COUNT(*) FROM member_history WHERE member_id = members.id) as appointment_count
      FROM members 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET single member by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST create new member
app.post('/api/members', async (req, res) => {
  try {
    const { name, email, phone, join_date, total_visits, status, last_visit } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO members (name, email, phone, join_date, total_visits, status, last_visit) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email?.trim() || null,
        phone || null,
        join_date || new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        parseInt(total_visits) || 0,
        status || 'active',
        last_visit || 'Never'
      ]
    );

    // Get the newly created member
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT update member
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, join_date, total_visits, status, last_visit } = req.body;

    // Check if member exists
    const [existing] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await pool.query(
      `UPDATE members 
       SET name = ?, email = ?, phone = ?, join_date = ?, total_visits = ?, status = ?, last_visit = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        email !== undefined ? email : existing[0].email,
        phone !== undefined ? phone : existing[0].phone,
        join_date !== undefined ? join_date : existing[0].join_date,
        total_visits !== undefined ? parseInt(total_visits) : existing[0].total_visits,
        status || existing[0].status,
        last_visit !== undefined ? last_visit : existing[0].last_visit,
        id
      ]
    );

    // Get updated member
    const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const [existing] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    await pool.query('DELETE FROM members WHERE id = ?', [id]);

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// GET member history
app.get('/api/members/history/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if member exists
    const [memberExists] = await pool.query('SELECT id FROM members WHERE id = ?', [memberId]);

    if (memberExists.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM member_history WHERE member_id = ? ORDER BY date DESC',
      [memberId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching member history:', error);
    res.status(500).json({ error: 'Failed to fetch member history' });
  }
});

// POST add treatment history
app.post('/api/members/history', async (req, res) => {
  try {
    const { member_id, date, treatment_name, therapist, amount, appointment_id, notes } = req.body;

    if (!member_id || !treatment_name) {
      return res.status(400).json({ error: 'Member ID and treatment name are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO member_history (member_id, date, treatment_name, therapist, amount, appointment_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id,
        date || new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        treatment_name,
        therapist || null,
        parseFloat(amount) || 0,
        appointment_id || null,
        notes || null
      ]
    );

    // Get the newly created history record
    const [rows] = await pool.query('SELECT * FROM member_history WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding member history:', error);
    res.status(500).json({ error: 'Failed to add member history' });
  }
});

const createTable = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');

    // Test query data
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM articles');
    console.log(`📊 Total articles in database: ${rows[0].count}`);

    // Create table if not exists
    const sql = `
      CREATE TABLE IF NOT EXISTS articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        status ENUM('Draft', 'Published') DEFAULT 'Draft',
        image LONGTEXT,
        author VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `;
    await connection.query(sql);
    console.log('✅ Articles table ready');

    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Error details:', error.code);
  }
};

// Initialize database
createTable();

// API Routes
// ============================
// APPOINTMENTS API ROUTES
// ============================

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { customer_name, customer_id, treatment, therapist, date, time, duration, amount, status, notes } = req.body;

    if (!customer_name || !treatment || !therapist || !date || !time) {
      return res.status(400).json({ error: 'Required fields: customer_name, treatment, therapist, date, time' });
    }

    // Generate appointment ID
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const count = countResult[0].count;
    const appointmentId = `APT${String(count + 1).padStart(5, '0')}`;

    const [result] = await pool.query(
      `INSERT INTO appointments (appointment_id, customer_name, customer_id, treatment, therapist, date, time, duration, amount, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        customer_name.trim(),
        customer_id || null,
        treatment.trim(),
        therapist.trim(),
        date,
        time,
        duration || '1 hour',
        parseFloat(amount) || 0,
        status || 'scheduled',
        notes?.trim() || ''
      ]
    );

    // Get the newly created appointment
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});


// GET all articles
app.get('/api/articles', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM articles 
      ORDER BY created_at DESC
    `);

    // Format dates
    const formattedRows = rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET single article by ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST create new article
app.post('/api/articles', async (req, res) => {
  try {
    const { title, content, category, status, image, author } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO articles (title, content, category, status, image, author) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, content, category, status || 'Draft', image || null, author || 'Admin']
    );

    // Get the newly created article
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);

    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT update article
app.put('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, status, image, author } = req.body;

    // Check if article exists
    const [existing] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await pool.query(
      `UPDATE articles 
       SET title = ?, content = ?, category = ?, status = ?, image = ?, author = ?
       WHERE id = ?`,
      [
        title || existing[0].title,
        content || existing[0].content,
        category || existing[0].category,
        status || existing[0].status,
        image !== undefined ? image : existing[0].image,
        author || existing[0].author,
        id
      ]
    );

    // Get updated article
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// PATCH update article status
app.patch('/api/articles/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Draft', 'Published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Check if article exists
    const [existing] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await pool.query('UPDATE articles SET status = ? WHERE id = ?', [status, id]);

    // Get updated article
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    res.json(article);
  } catch (error) {
    console.error('Error updating article status:', error);
    res.status(500).json({ error: 'Failed to update article status' });
  }
});

// DELETE article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const [existing] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await pool.query('DELETE FROM articles WHERE id = ?', [id]);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// GET articles by category
app.get('/api/articles/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE category = ? ORDER BY created_at DESC',
      [category]
    );

    const formattedRows = rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});