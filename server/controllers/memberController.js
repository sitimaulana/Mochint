const Member = require('../models/Member');

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.getAll();
    res.json({ 
      success: true, 
      count: members.length,
      data: members 
    });
  } catch (error) {
    console.error('Error getting members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get members',
      message: error.message 
    });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.getById(id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error getting member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get member',
      message: error.message 
    });
  }
};

// Create new member
exports.createMember = async (req, res) => {
  try {
    const memberData = req.body;
    
    // Generate ID jika tidak ada
    if (!memberData.id) {
      const lastMember = await Member.getLastId();
      const lastNumber = lastMember ? parseInt(lastMember.id.substring(1)) : 0;
      memberData.id = `M${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    // Set join date jika tidak ada
    if (!memberData.join_date) {
      memberData.join_date = new Date().toISOString().split('T')[0];
    }
    
    const result = await Member.create(memberData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Member created successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create member',
      message: error.message 
    });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberData = req.body;
    
    const affectedRows = await Member.update(id, memberData);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Member updated successfully' 
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update member',
      message: error.message 
    });
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affectedRows = await Member.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete member',
      message: error.message 
    });
  }
};

// Search members
exports.searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q || '';
    
    const members = await Member.search(searchTerm);
    
    res.json({ 
      success: true, 
      count: members.length,
      data: members 
    });
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search members',
      message: error.message 
    });
  }
};

// Get member statistics
exports.getMemberStats = async (req, res) => {
  try {
    const stats = await Member.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting member stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get member stats',
      message: error.message 
    });
  }
};