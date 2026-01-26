const { promisePool } = require('../config/database');

class Therapist {
  // Get all therapists
  static async getAll() {
    const [rows] = await promisePool.query(`
      SELECT * FROM therapists 
      ORDER BY 
        CASE status 
          WHEN 'active' THEN 1 
          ELSE 2 
        END,
        name ASC
    `);
    return rows;
  }

  // Get therapist by ID
  static async getById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM therapists WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get therapist by name
  static async getByName(name) {
    const [rows] = await promisePool.query(
      'SELECT * FROM therapists WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  // Get last therapist ID
  static async getLastId() {
    const [rows] = await promisePool.query(
      'SELECT id FROM therapists ORDER BY id DESC LIMIT 1'
    );
    return rows[0];
  }

  // Create new therapist
  static async create(therapistData) {
    const {
      id,
      name,
      email,
      phone,
      specialization,
      experience_years = 0,
      status = 'active',
      working_hours = ''
    } = therapistData;

    const [result] = await promisePool.query(
      `INSERT INTO therapists 
       (id, name, email, phone, specialization, experience_years, status, working_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, phone, specialization || null, experience_years, status, working_hours || null]
    );

    return { id, insertId: result.insertId };
  }

  // Update therapist
  static async update(id, therapistData) {
    const {
      name,
      email,
      phone,
      specialization,
      experience_years,
      status,
      working_hours
    } = therapistData;

    const [result] = await promisePool.query(
      `UPDATE therapists SET
        name = ?, email = ?, phone = ?, specialization = ?,
        experience_years = ?, status = ?, working_hours = ?
       WHERE id = ?`,
      [name, email, phone, specialization || null, experience_years || null, status, working_hours || null, id]
    );

    return result.affectedRows;
  }

  // Delete therapist
  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM therapists WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Increment treatment count
  static async incrementTreatmentCount(id) {
    const [result] = await promisePool.query(
      'UPDATE therapists SET total_treatments = total_treatments + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get active therapists
  static async getActive() {
    const [rows] = await promisePool.query(
      `SELECT * FROM therapists 
       WHERE status = 'active' 
       ORDER BY name ASC`
    );
    return rows;
  }

  // Get therapists by status
  static async getByStatus(status) {
    const [rows] = await promisePool.query(
      `SELECT * FROM therapists 
       WHERE status = ? 
       ORDER BY name ASC`,
      [status]
    );
    return rows;
  }

  // Get top therapists by treatments
  static async getTopTherapists(limit = 5) {
    const [rows] = await promisePool.query(
      `SELECT * FROM therapists 
       WHERE status = 'active' AND total_treatments > 0
       ORDER BY total_treatments DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Get therapist statistics
  static async getStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(total_treatments) as total_treatments,
        ROUND(AVG(total_treatments), 1) as avg_treatments,
        MAX(total_treatments) as max_treatments,
        MIN(total_treatments) as min_treatments
      FROM therapists
    `);
    return rows[0];
  }

  // Get specialization statistics
  static async getSpecializationStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        specialization,
        COUNT(*) as therapist_count,
        SUM(total_treatments) as total_treatments
      FROM therapists
      WHERE specialization IS NOT NULL AND specialization != ''
      GROUP BY specialization
      ORDER BY therapist_count DESC
    `);
    return rows;
  }

  // Search therapists
  static async search(searchTerm) {
    const [rows] = await promisePool.query(
      `SELECT * FROM therapists 
       WHERE name LIKE ? 
          OR email LIKE ? 
          OR phone LIKE ?
          OR specialization LIKE ?
          OR notes LIKE ?
          OR id LIKE ?
       ORDER BY name`,
      [
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`
      ]
    );
    return rows;
  }

  // Get therapist performance (with appointment details)
  static async getPerformanceStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        th.id,
        th.name,
        th.specialization,
        th.total_treatments,
        th.status,
        COUNT(DISTINCT a.id) as total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_appointments,
        SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_appointments,
        COALESCE(SUM(a.amount), 0) as total_revenue
      FROM therapists th
      LEFT JOIN appointments a ON th.id = a.therapist_id
      GROUP BY th.id, th.name, th.specialization, th.total_treatments, th.status
      ORDER BY total_treatments DESC
    `);
    return rows;
  }
}

module.exports = Therapist;