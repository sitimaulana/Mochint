const { promisePool } = require('../config/database');

// Get disabled timeslots for a specific date
const getDisabledTimeslots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date parameter is required' 
      });
    }

    const [rows] = await promisePool.query(
      'SELECT * FROM disabled_timeslots WHERE date = ? ORDER BY time_slot',
      [date]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching disabled timeslots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disabled timeslots',
      error: error.message
    });
  }
};

// Get all disabled timeslots (for admin overview)
const getAllDisabledTimeslots = async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM disabled_timeslots ORDER BY date DESC, time_slot',
      []
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching all disabled timeslots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disabled timeslots',
      error: error.message
    });
  }
};

// Toggle timeslot (disable or enable)
const toggleTimeslot = async (req, res) => {
  try {
    const { date, time_slot, reason = '' } = req.body;

    if (!date || !time_slot) {
      return res.status(400).json({
        success: false,
        message: 'Date and time_slot are required'
      });
    }

    // Check if timeslot is already disabled
    const [existing] = await promisePool.query(
      'SELECT * FROM disabled_timeslots WHERE date = ? AND time_slot = ?',
      [date, time_slot]
    );

    if (existing.length > 0) {
      // Enable: Remove from disabled list
      await promisePool.query(
        'DELETE FROM disabled_timeslots WHERE date = ? AND time_slot = ?',
        [date, time_slot]
      );

      res.json({
        success: true,
        message: 'Timeslot enabled successfully',
        action: 'enabled'
      });
    } else {
      // Disable: Add to disabled list
      await promisePool.query(
        'INSERT INTO disabled_timeslots (date, time_slot, reason) VALUES (?, ?, ?)',
        [date, time_slot, reason]
      );

      res.json({
        success: true,
        message: 'Timeslot disabled successfully',
        action: 'disabled'
      });
    }
  } catch (error) {
    console.error('Error toggling timeslot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle timeslot',
      error: error.message
    });
  }
};

// Delete specific disabled timeslot
const deleteDisabledTimeslot = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.query(
      'DELETE FROM disabled_timeslots WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Disabled timeslot not found'
      });
    }

    res.json({
      success: true,
      message: 'Disabled timeslot removed successfully'
    });
  } catch (error) {
    console.error('Error deleting disabled timeslot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete disabled timeslot',
      error: error.message
    });
  }
};

// Clear old disabled timeslots (older than today)
const clearOldDisabledTimeslots = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [result] = await promisePool.query(
      'DELETE FROM disabled_timeslots WHERE date < ?',
      [today]
    );

    res.json({
      success: true,
      message: `Cleared ${result.affectedRows} old disabled timeslots`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Error clearing old timeslots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old disabled timeslots',
      error: error.message
    });
  }
};

module.exports = {
  getDisabledTimeslots,
  getAllDisabledTimeslots,
  toggleTimeslot,
  deleteDisabledTimeslot,
  clearOldDisabledTimeslots
};
