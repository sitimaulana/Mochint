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

// ============================
// CREATE ALL TABLES
// ============================

const createMembersTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
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

    // Create member_history table
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

const createTherapistsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS therapists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        therapist_id VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
        total_treatments INT DEFAULT 0,
        join_date VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_name (name),
        INDEX idx_email (email)
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Therapists table ready');
  } catch (error) {
    console.error('❌ Error creating therapists table:', error);
  }
};

const createTreatmentsTable = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create treatments table
    const treatmentsSql = `
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
    await connection.query(treatmentsSql);

    // Create treatment_facilities table (SIMPLE VERSION - tanpa deskripsi)
    const facilitiesSql = `
      CREATE TABLE IF NOT EXISTS treatment_facilities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        treatment_id INT NOT NULL,
        facility_name VARCHAR(100) NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
        INDEX idx_treatment_id (treatment_id)
      )
    `;
    await connection.query(facilitiesSql);

    connection.release();
    console.log('✅ Treatments and facilities tables ready');
  } catch (error) {
    console.error('❌ Error creating treatments table:', error);
  }
};

const createProductsTable = async () => {
  try {
    const connection = await pool.getConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        weight INT DEFAULT 0, -- TAMBAHKAN FIELD WEIGHT
        description TEXT,
        image LONGTEXT,
        marketplace_links JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_price (price),
        INDEX idx_weight (weight)
      )
    `;
    await connection.query(sql);
    connection.release();
    console.log('✅ Products table ready (with weight field)');
  } catch (error) {
    console.error('❌ Error creating products table:', error);
  }
};

const createArticlesTable = async () => {
  try {
    const connection = await pool.getConnection();
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
    console.error('❌ Error creating articles table:', error);
  }
};

// Initialize all tables
createMembersTable();
createAppointmentsTable();
createTherapistsTable();
createTreatmentsTable();
createProductsTable();
createArticlesTable();

// ============================
// MEMBERS API ROUTES
// ============================

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
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST create new member
app.post('/api/members', async (req, res) => {
  try {
    const { name, email, phone, address, join_date, total_visits, status, last_visit } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const [result] = await pool.query(
      `INSERT INTO members (name, email, phone, address, join_date, total_visits, status, last_visit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email?.trim() || null,
        phone || null,
        address?.trim() || null,
        join_date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        parseInt(total_visits) || 0,
        status || 'active',
        last_visit || 'Never'
      ]
    );

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
    const { name, email, phone, address, join_date, total_visits, status, last_visit } = req.body;

    const [existing] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Member not found' });

    await pool.query(
      `UPDATE members SET name = ?, email = ?, phone = ?, address = ?, 
       join_date = ?, total_visits = ?, status = ?, last_visit = ? WHERE id = ?`,
      [
        name || existing[0].name,
        email !== undefined ? email : existing[0].email,
        phone !== undefined ? phone : existing[0].phone,
        address !== undefined ? address : existing[0].address,
        join_date !== undefined ? join_date : existing[0].join_date,
        total_visits !== undefined ? parseInt(total_visits) : existing[0].total_visits,
        status || existing[0].status,
        last_visit !== undefined ? last_visit : existing[0].last_visit,
        id
      ]
    );

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
    const [existing] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Member not found' });

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
    const [memberExists] = await pool.query('SELECT id FROM members WHERE id = ?', [memberId]);
    if (memberExists.length === 0) return res.status(404).json({ error: 'Member not found' });

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

// ============================
// TREATMENTS WITH FACILITIES API ROUTES
// ============================

// GET all treatments with facilities
app.get('/api/treatments', async (req, res) => {
  try {
    const [treatments] = await pool.query('SELECT * FROM treatments ORDER BY created_at DESC');
    
    for (let treatment of treatments) {
      const [facilities] = await pool.query(
        'SELECT facility_name FROM treatment_facilities WHERE treatment_id = ? ORDER BY display_order, created_at',
        [treatment.id]
      );
      treatment.facilities = facilities.map(f => f.facility_name);
    }

    res.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// GET single treatment by ID with facilities
app.get('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [treatmentRows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    if (treatmentRows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    const treatment = treatmentRows[0];
    const [facilities] = await pool.query(
      'SELECT facility_name FROM treatment_facilities WHERE treatment_id = ? ORDER BY display_order, created_at',
      [treatment.id]
    );
    
    treatment.facilities = facilities.map(f => f.facility_name);
    res.json(treatment);
  } catch (error) {
    console.error('Error fetching treatment:', error);
    res.status(500).json({ error: 'Failed to fetch treatment' });
  }
});

// POST create new treatment with facilities
app.post('/api/treatments', async (req, res) => {
  try {
    const { name, category, duration, price, description, image, facilities } = req.body;

    if (!name || !category || !duration || !price) {
      return res.status(400).json({ error: 'Name, category, duration, and price are required' });
    }

    const priceNumber = parseFloat(price) || 0;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert treatment
      const [treatmentResult] = await connection.query(
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

      const treatmentId = treatmentResult.insertId;

      // Insert facilities if provided
      if (facilities && Array.isArray(facilities) && facilities.length > 0) {
        const facilityValues = facilities
          .filter(facility => facility && facility.trim())
          .map((facility, index) => [treatmentId, facility.trim(), index]);
        
        if (facilityValues.length > 0) {
          await connection.query(
            `INSERT INTO treatment_facilities (treatment_id, facility_name, display_order) 
             VALUES ?`,
            [facilityValues]
          );
        }
      }

      await connection.commit();
      connection.release();

      // Get the newly created treatment with facilities
      const [treatmentRows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [treatmentId]);
      const treatment = treatmentRows[0];
      
      const [facilityRows] = await pool.query(
        'SELECT facility_name FROM treatment_facilities WHERE treatment_id = ? ORDER BY display_order, created_at',
        [treatmentId]
      );
      treatment.facilities = facilityRows.map(f => f.facility_name);

      res.status(201).json(treatment);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error creating treatment:', error);
    res.status(500).json({ error: 'Failed to create treatment' });
  }
});

// PUT update treatment with facilities
app.put('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, duration, price, description, image, facilities } = req.body;

    // Check if treatment exists
    const [existingTreatment] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);

    if (existingTreatment.length === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    const priceNumber = price !== undefined ? parseFloat(price) : existingTreatment[0].price;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update treatment
      await connection.query(
        `UPDATE treatments SET name = ?, category = ?, duration = ?, price = ?, description = ?, image = ? WHERE id = ?`,
        [
          name || existingTreatment[0].name,
          category || existingTreatment[0].category,
          duration || existingTreatment[0].duration,
          priceNumber,
          description !== undefined ? description : existingTreatment[0].description,
          image !== undefined ? image : existingTreatment[0].image,
          id
        ]
      );

      // Delete existing facilities
      await connection.query('DELETE FROM treatment_facilities WHERE treatment_id = ?', [id]);

      // Insert new facilities if provided
      if (facilities && Array.isArray(facilities) && facilities.length > 0) {
        const facilityValues = facilities
          .filter(facility => facility && facility.trim())
          .map((facility, index) => [id, facility.trim(), index]);
        
        if (facilityValues.length > 0) {
          await connection.query(
            `INSERT INTO treatment_facilities (treatment_id, facility_name, display_order) VALUES ?`,
            [facilityValues]
          );
        }
      }

      await connection.commit();
      connection.release();

      // Get updated treatment with facilities
      const [treatmentRows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);
      const treatment = treatmentRows[0];
      
      const [facilityRows] = await pool.query(
        'SELECT facility_name FROM treatment_facilities WHERE treatment_id = ? ORDER BY display_order, created_at',
        [id]
      );
      treatment.facilities = facilityRows.map(f => f.facility_name);

      res.json(treatment);
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating treatment:', error);
    res.status(500).json({ error: 'Failed to update treatment' });
  }
});

// DELETE treatment
app.delete('/api/treatments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Treatment not found' });

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
    const [treatments] = await pool.query(
      'SELECT * FROM treatments WHERE category = ? ORDER BY price ASC',
      [category]
    );

    for (let treatment of treatments) {
      const [facilities] = await pool.query(
        'SELECT facility_name FROM treatment_facilities WHERE treatment_id = ? ORDER BY display_order, created_at',
        [treatment.id]
      );
      treatment.facilities = facilities.map(f => f.facility_name);
    }

    res.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments by category:', error);
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// ============================
// APPOINTMENTS API ROUTES (UPDATED - WITHOUT NOTES)
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

// GET single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST create new appointment (WITHOUT NOTES)
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('POST /api/appointments - Request body:', req.body);
    
    const { customer_name, customer_id, treatment, therapist, date, time, amount, status } = req.body;
    if (!customer_name || !treatment || !therapist || !date || !time) {
      return res.status(400).json({ error: 'Customer name, treatment, therapist, date, and time are required' });
    }

    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const appointmentId = `APT${String(countResult[0].count + 1).padStart(5, '0')}`;

    // Normalize status to lowercase
    const validStatuses = ['pending', 'confirmed', 'completed'];
    let normalizedStatus = 'pending';
    
    if (status) {
      const lowerStatus = status.toLowerCase();
      if (validStatuses.includes(lowerStatus)) {
        normalizedStatus = lowerStatus;
      } else {
        console.warn(`Invalid status received: ${status}. Defaulting to 'pending'`);
      }
    }
    
    console.log('Creating appointment with status:', normalizedStatus);

    const [result] = await pool.query(
      `INSERT INTO appointments (appointment_id, customer_name, customer_id, treatment, therapist, date, time, amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        customer_name.trim(),
        customer_id || null,
        treatment.trim(),
        therapist.trim(),
        date,
        time,
        parseFloat(amount) || 0,
        normalizedStatus // SELALU lowercase
      ]
    );

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    console.log('Created appointment:', rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});


// PUT update appointment (WITHOUT NOTES)
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_id, treatment, therapist, date, time, amount, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    // VALIDASI DAN NORMALISASI STATUS
    let finalStatus = existing[0].status; // default to existing status
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'completed'];
      const lowerStatus = status.toLowerCase();
      if (validStatuses.includes(lowerStatus)) {
        finalStatus = lowerStatus;
      } else {
        console.warn(`Invalid status received: ${status}. Keeping existing status: ${finalStatus}`);
      }
    }

    await pool.query(
      `UPDATE appointments SET customer_name = ?, customer_id = ?, treatment = ?, therapist = ?, 
       date = ?, time = ?, amount = ?, status = ? WHERE id = ?`,
      [
        customer_name || existing[0].customer_name,
        customer_id !== undefined ? customer_id : existing[0].customer_id,
        treatment || existing[0].treatment,
        therapist || existing[0].therapist,
        date || existing[0].date,
        time || existing[0].time,
        amount !== undefined ? parseFloat(amount) : existing[0].amount,
        finalStatus, // Use validated status
        id
      ]
    );

    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
    
    // Normalize status to lowercase just to be safe
    const normalizedRows = rows.map(row => ({
      ...row,
      status: row.status ? row.status.toLowerCase() : 'pending'
    }));
    
    res.json(normalizedRows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// DELETE appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// ============================
// THERAPISTS API ROUTES
// ============================

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
    if (rows.length === 0) return res.status(404).json({ error: 'Therapist not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching therapist:', error);
    res.status(500).json({ error: 'Failed to fetch therapist' });
  }
});

// POST create new therapist
app.post('/api/therapists', async (req, res) => {
  try {
    const { name, email, phone, status, join_date } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM therapists');
    const therapistId = `TH${String(countResult[0].count + 1).padStart(3, '0')}`;
    
    // Gunakan join_date dari request jika ada, jika tidak gunakan tanggal hari ini
    const joinDate = join_date || new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });

    const [result] = await pool.query(
      `INSERT INTO therapists (therapist_id, name, email, phone, status, join_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        therapistId,
        name.trim(),
        email.trim(),
        phone || null,
        status || 'active',
        joinDate
      ]
    );

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
    const { name, email, phone, status, join_date } = req.body;

    // Check if therapist exists
    const [existing] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    await pool.query(
      `UPDATE therapists SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        status = ?,
        join_date = ? 
       WHERE id = ?`,
      [
        name || existing[0].name,
        email || existing[0].email,
        phone !== undefined ? phone : existing[0].phone,
        status || existing[0].status,
        join_date !== undefined ? join_date : existing[0].join_date,
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
    const [existing] = await pool.query('SELECT * FROM therapists WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Therapist not found' });

    await pool.query('DELETE FROM therapists WHERE id = ?', [id]);
    res.json({ message: 'Therapist deleted successfully' });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    res.status(500).json({ error: 'Failed to delete therapist' });
  }
});

// ============================
// PRODUCTS API ROUTES
// ============================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const formattedRows = rows.map(row => ({
      ...row,
      marketplaceLinks: row.marketplace_links ? JSON.parse(row.marketplace_links) : {
        shopee: '',
        tokopedia: '',
        lazada: '',
        other: ''
      }
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
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : {
      shopee: '',
      tokopedia: '',
      lazada: '',
      other: ''
    };
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product
app.post('/api/products', async (req, res) => {
  try {
    const { 
      name, 
      category, 
      price, 
      weight, 
      description, 
      image, 
      marketplaceLinks 
    } = req.body;
    
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const priceNumber = parseFloat(price) || 0;
    const weightNumber = parseInt(weight) || 0;
    
    // Default marketplace links jika tidak ada
    const defaultMarketplaceLinks = {
      shopee: '',
      tokopedia: '',
      lazada: '',
      other: ''
    };
    
    const marketplaceLinksJSON = marketplaceLinks 
      ? JSON.stringify({ ...defaultMarketplaceLinks, ...marketplaceLinks })
      : JSON.stringify(defaultMarketplaceLinks);

    const [result] = await pool.query(
      `INSERT INTO products (name, category, price, weight, description, image, marketplace_links) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category,
        priceNumber,
        weightNumber,
        description?.trim() || '',
        image || null,
        marketplaceLinksJSON
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    const product = rows[0];
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : defaultMarketplaceLinks;
    
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
    const { 
      name, 
      category, 
      price, 
      weight, 
      description, 
      image, 
      marketplaceLinks 
    } = req.body;

    // Check if product exists
    const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const priceNumber = price !== undefined ? parseFloat(price) : existingProduct[0].price;
    const weightNumber = weight !== undefined ? parseInt(weight) : existingProduct[0].weight;
    
    // Handle marketplace links update
    let marketplaceLinksJSON;
    if (marketplaceLinks) {
      const existingLinks = existingProduct[0].marketplace_links 
        ? JSON.parse(existingProduct[0].marketplace_links)
        : {
            shopee: '',
            tokopedia: '',
            lazada: '',
            other: ''
          };
      
      const updatedLinks = { ...existingLinks, ...marketplaceLinks };
      marketplaceLinksJSON = JSON.stringify(updatedLinks);
    } else {
      marketplaceLinksJSON = existingProduct[0].marketplace_links;
    }

    await pool.query(
      `UPDATE products SET 
        name = ?, 
        category = ?, 
        price = ?, 
        weight = ?, 
        description = ?, 
        image = ?, 
        marketplace_links = ? 
       WHERE id = ?`,
      [
        name || existingProduct[0].name,
        category || existingProduct[0].category,
        priceNumber,
        weightNumber,
        description !== undefined ? description : existingProduct[0].description,
        image !== undefined ? image : existingProduct[0].image,
        marketplaceLinksJSON,
        id
      ]
    );

    // Get updated product
    const [updatedRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product = updatedRows[0];
    product.marketplaceLinks = product.marketplace_links ? JSON.parse(product.marketplace_links) : {
      shopee: '',
      tokopedia: '',
      lazada: '',
      other: ''
    };
    
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
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Product not found' });

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================
// ARTICLES API ROUTES
// ============================

// GET all articles
app.get('/api/articles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    const formattedRows = rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
    if (rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    
    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

    const [existing] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Article not found' });

    await pool.query(
      `UPDATE articles SET title = ?, content = ?, category = ?, status = ?, image = ?, author = ? WHERE id = ?`,
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

    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    const article = rows[0];
    article.date = new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE article
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Article not found' });

    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// ============================
// HEALTH CHECK
// ============================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      members: 'Available',
      appointments: 'Available',
      therapists: 'Available',
      treatments: 'Available',
      products: 'Available',
      articles: 'Available'
    }
  });
});

// ============================
// START SERVER
// ============================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check available at http://localhost:${PORT}/health`);
});