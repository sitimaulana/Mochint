// server/models/Member.js - SIMPLIFIED VERSION
const { promisePool } = require('../config/database');

const Member = {
  // Get all members - SIMPLE QUERY
  getAll: async () => {
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
  },

  // Get member by ID
  getById: async (id) => {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM members WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in Member.getById:', error);
      throw error;
    }
  },

  // Create new member
  create: async (memberData) => {
    const { name, email, phone, joinDate, totalVisits = 0, status = 'active', lastVisit = 'Never' } = memberData;
    
    try {
      // Generate ID
      const [countResult] = await promisePool.query('SELECT COUNT(*) as count FROM members');
      const memberCount = countResult[0].count;
      const id = `M${String(memberCount + 1).padStart(3, '0')}`;
      
      const [result] = await promisePool.query(
        `INSERT INTO members (id, name, email, phone, join_date, total_visits, status, last_visit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, phone, joinDate, totalVisits, status, lastVisit]
      );
      
      return { id, ...memberData };
    } catch (error) {
      console.error('Error in Member.create:', error);
      throw error;
    }
  },

  // Update member
  update: async (id, memberData) => {
    const { name, email, phone, joinDate, totalVisits, status, lastVisit } = memberData;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE members 
         SET name = ?, email = ?, phone = ?, join_date = ?, 
             total_visits = ?, status = ?, last_visit = ?
         WHERE id = ?`,
        [name, email, phone, joinDate, totalVisits, status, lastVisit, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Member.update:', error);
      throw error;
    }
  },

  // Delete member
  delete: async (id) => {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM members WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Member.delete:', error);
      throw error;
    }
  }
};

module.exports = Member;