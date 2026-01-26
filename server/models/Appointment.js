const { promisePool } = require('../config/database');

class Appointment {
  // Get all appointments with details
  static async getAll() {
    const [rows] = await promisePool.query(`
      SELECT 
        a.*,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        t.name as treatment_name,
        t.category as treatment_category,
        t.duration as treatment_duration,
        th.name as therapist_name,
        th.specialization as therapist_specialization
      FROM appointments a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      LEFT JOIN therapists th ON a.therapist_id = th.id
      ORDER BY a.appointment_date DESC
    `);
    return rows;
  }

  // Get appointment by ID
  static async getById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Get last appointment ID
  static async getLastId() {
    const [rows] = await promisePool.query(
      'SELECT id FROM appointments ORDER BY id DESC LIMIT 1'
    );
    return rows[0];
  }

  // Create new appointment
  static async create(appointmentData) {
    const {
      id,
      member_id,
      customer_name,
      treatment_id,
      therapist_id,
      appointment_date,
      amount,
      status = 'pending',
      notes
    } = appointmentData;

    const [result] = await promisePool.query(
      `INSERT INTO appointments 
       (id, member_id, customer_name, treatment_id, therapist_id, 
        appointment_date, amount, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, member_id, customer_name, treatment_id, therapist_id, 
       appointment_date, amount, status, notes]
    );
    
    return { id, insertId: result.insertId };
  }

  // Update appointment
  static async update(id, appointmentData) {
    const {
      member_id,
      customer_name,
      treatment_id,
      therapist_id,
      appointment_date,
      amount,
      status,
      notes
    } = appointmentData;

    const [result] = await promisePool.query(
      `UPDATE appointments SET
        member_id = ?, customer_name = ?, treatment_id = ?, therapist_id = ?,
        appointment_date = ?, amount = ?, status = ?, notes = ?
       WHERE id = ?`,
      [member_id, customer_name, treatment_id, therapist_id,
       appointment_date, amount, status, notes, id]
    );
    
    return result.affectedRows;
  }

  // Delete appointment
  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM appointments WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Update appointment status
  static async updateStatus(id, status) {
    const [result] = await promisePool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }

  // Complete appointment and update therapist count
  static async complete(id) {
    // First get appointment details
    const appointment = await this.getById(id);
    
    if (appointment && appointment.therapist_id) {
      // Increment therapist treatment count
      await promisePool.query(
        'UPDATE therapists SET total_treatments = total_treatments + 1 WHERE id = ?',
        [appointment.therapist_id]
      );
    }
    
    if (appointment && appointment.member_id) {
      // Increment member visit count
      await promisePool.query(
        `UPDATE members 
         SET total_visits = total_visits + 1, last_visit = CURDATE()
         WHERE id = ?`,
        [appointment.member_id]
      );
    }
    
    // Update appointment status to completed
    return await this.updateStatus(id, 'completed');
  }

  // Get appointments by status
  static async getByStatus(status) {
    const [rows] = await promisePool.query(
      `SELECT a.*, m.name as member_name, t.name as treatment_name, 
              th.name as therapist_name
       FROM appointments a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN treatments t ON a.treatment_id = t.id
       LEFT JOIN therapists th ON a.therapist_id = th.id
       WHERE a.status = ?
       ORDER BY a.appointment_date DESC`,
      [status]
    );
    return rows;
  }

  // Get appointments by member ID
  static async getByMemberId(memberId) {
    const [rows] = await promisePool.query(
      `SELECT a.*, t.name as treatment_name, th.name as therapist_name
       FROM appointments a
       LEFT JOIN treatments t ON a.treatment_id = t.id
       LEFT JOIN therapists th ON a.therapist_id = th.id
       WHERE a.member_id = ?
       ORDER BY a.appointment_date DESC`,
      [memberId]
    );
    return rows;
  }

  // Get appointments by therapist ID
  static async getByTherapistId(therapistId) {
    const [rows] = await promisePool.query(
      `SELECT a.*, m.name as member_name, t.name as treatment_name
       FROM appointments a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN treatments t ON a.treatment_id = t.id
       WHERE a.therapist_id = ?
       ORDER BY a.appointment_date DESC`,
      [therapistId]
    );
    return rows;
  }

  // Get today's appointments
  static async getTodayAppointments() {
    const [rows] = await promisePool.query(
      `SELECT a.*, m.name as member_name, t.name as treatment_name,
              th.name as therapist_name
       FROM appointments a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN treatments t ON a.treatment_id = t.id
       LEFT JOIN therapists th ON a.therapist_id = th.id
       WHERE DATE(a.appointment_date) = CURDATE()
       ORDER BY a.appointment_date`
    );
    return rows;
  }

  // Get upcoming appointments (next 7 days)
  static async getUpcomingAppointments() {
    const [rows] = await promisePool.query(
      `SELECT a.*, m.name as member_name, t.name as treatment_name,
              th.name as therapist_name
       FROM appointments a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN treatments t ON a.treatment_id = t.id
       LEFT JOIN therapists th ON a.therapist_id = th.id
       WHERE a.appointment_date >= CURDATE() 
         AND a.status IN ('pending', 'confirmed')
         AND a.appointment_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY a.appointment_date ASC
       LIMIT 20`
    );
    return rows;
  }

  // Get appointment statistics
  static async getStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN DATE(appointment_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 1 END) as tomorrow
      FROM appointments
    `);
    return rows[0];
  }

  // Get revenue statistics by date
  static async getRevenueStats(days = 30) {
    const [rows] = await promisePool.query(`
      SELECT 
        DATE(appointment_date) as date,
        COUNT(*) as appointment_count,
        SUM(amount) as daily_revenue
      FROM appointments
      WHERE status = 'completed'
        AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(appointment_date)
      ORDER BY date DESC
    `, [days]);
    return rows;
  }

  // Search appointments
  static async search(searchTerm) {
    const [rows] = await promisePool.query(
      `SELECT a.*, m.name as member_name, t.name as treatment_name,
              th.name as therapist_name
       FROM appointments a
       LEFT JOIN members m ON a.member_id = m.id
       LEFT JOIN treatments t ON a.treatment_id = t.id
       LEFT JOIN therapists th ON a.therapist_id = th.id
       WHERE a.customer_name LIKE ? 
          OR m.name LIKE ? 
          OR m.email LIKE ?
          OR t.name LIKE ?
          OR th.name LIKE ?
          OR a.id LIKE ?
       ORDER BY a.appointment_date DESC`,
      [
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`,
        `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`
      ]
    );
    return rows;
  }
}

module.exports = Appointment;