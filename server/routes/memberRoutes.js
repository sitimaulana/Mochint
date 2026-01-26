// server/routes/memberRoutes.js - SIMPLIFIED
const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// GET all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.getAll();
    
    res.json({
      success: true,
      message: 'Members retrieved successfully',
      data: members,
      count: members.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members',
      message: error.message
    });
  }
});

// CREATE new member
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, joinDate, totalVisits, status, lastVisit } = req.body;
    
    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Name, email, and phone are required'
      });
    }
    
    const memberData = {
      name,
      email,
      phone,
      joinDate: joinDate || new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      totalVisits: totalVisits || 0,
      status: status || 'active',
      lastVisit: lastVisit || 'Never'
    };
    
    const newMember = await Member.create(memberData);
    
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: newMember
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create member',
      message: error.message
    });
  }
});

// UPDATE member
router.put('/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, email, phone, joinDate, totalVisits, status, lastVisit } = req.body;
    
    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Name, email, and phone are required'
      });
    }
    
    const memberData = {
      name,
      email,
      phone,
      joinDate,
      totalVisits: parseInt(totalVisits) || 0,
      status,
      lastVisit
    };
    
    const updated = await Member.update(memberId, memberData);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: memberData
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member',
      message: error.message
    });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Member.delete(req.params.id);
    
    if (!deleted) {
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
});

module.exports = router;