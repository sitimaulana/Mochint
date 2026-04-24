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
        'SELECT id, name, email, password, phone, address, join_date, google_id, profile_picture FROM members WHERE email = ? LIMIT 1',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Member.findByEmail:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await promisePool.query(
        'SELECT id, name, email, phone, address, join_date, google_id, profile_picture FROM members WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Member.findById:', error);
      throw error;
    }
  }

  static async create({ name, email, phone, address, password, google_id = null, profile_picture = null }) {
    try {
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      const joinDate = new Date().toISOString().split('T')[0];

      const [result] = await promisePool.query(
        'INSERT INTO members (name, email, phone, address, password, join_date, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone || '', address || '', hashedPassword, joinDate, google_id, profile_picture]
      );

      return {
        id: result.insertId,
        name,
        email,
        phone: phone || '',
        address: address || '',
        join_date: joinDate,
        google_id,
        profile_picture
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

      if (fields.length === 0) {
        console.warn('⚠️ No fields to update for member:', id);
        return { affectedRows: 0 };
      }

      params.push(id);
      const query = `UPDATE members SET ${fields.join(', ')} WHERE id = ?`;
      
      console.log('🔍 SQL Query:', query);
      console.log('🔍 Parameters:', params);
      
      const [result] = await promisePool.query(query, params);
      
      console.log('✅ Update executed, affected rows:', result.affectedRows);
      
      return { affectedRows: result.affectedRows };
    } catch (error) {
      console.error('❌ Error in Member.update:', error);
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

  // Update password only (for Google OAuth users)
  static async updatePassword(id, hashedPassword) {
    try {
      const [result] = await promisePool.query(
        'UPDATE members SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      console.log('✅ Password updated for member ID:', id);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Error in Member.updatePassword:', error);
      throw error;
    }
  }
}

module.exports = Member;