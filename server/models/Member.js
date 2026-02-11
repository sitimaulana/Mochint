// server/models/Member.js - UPDATED VERSION
const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Member {
  static async getHistoryById(id) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM appointments WHERE member_id = ? ORDER BY date DESC, time DESC',
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error in Member.getHistoryById:', error);
      throw error;
    } 
  }

  static async getAll() {
    try {
      console.log('🔍 Fetching all members...');
      const [rows] = await promisePool.query(
        'SELECT * FROM members ORDER BY created_at DESC'
      );
      console.log(`✅ Found ${rows.length} members`);
      return rows;
    } catch (error) {
      console.error('❌ Database error:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM members WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Member.getById:', error);
      throw error;
    }
  }

  // include password so auth can verify
  static async findByEmail(email) {
    try {
      const [rows] = await promisePool.query(
        'SELECT id, name, email, password, phone, address, join_date FROM members WHERE email = ? LIMIT 1',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Member.findByEmail:', error);
      throw error;
    }
  }

  static async create({ name, email, phone, address, password }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const joinDate = new Date().toISOString().split('T')[0];

      const [result] = await promisePool.query(
        'INSERT INTO members (name, email, phone, address, password, join_date) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, phone, address, hashedPassword, joinDate]
      );

      return {
        id: result.insertId,
        name,
        email,
        phone,
        address,
        join_date: joinDate
      };
    } catch (error) {
      console.error('Error in Member.create:', error);
      throw error;
    }
  }

  static async update(id, { name, email, phone, address, password }) {
    try {
      const fields = [];
      const params = [];

      if (name !== undefined) { fields.push('name = ?'); params.push(name); }
      if (email !== undefined) { fields.push('email = ?'); params.push(email); }
      if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
      if (address !== undefined) { fields.push('address = ?'); params.push(address); }
      if (password !== undefined) {
        const hashed = await bcrypt.hash(password, 10);
        fields.push('password = ?');
        params.push(hashed);
      }

      if (fields.length === 0) return { affectedRows: 0 };

      params.push(id);
      const [result] = await promisePool.query(
        `UPDATE members SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      return { affectedRows: result.affectedRows };
    } catch (error) {
      console.error('Error in Member.update:', error);
      throw error;
    }
  }

  static async remove(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM members WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Member.remove:', error);
      throw error;
    }
  }
}

module.exports = Member;