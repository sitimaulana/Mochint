const express = require('express');
const router = express.Router();
const timeslotController = require('../controllers/timeslotController');

// Get disabled timeslots for a specific date (public for users)
router.get('/', timeslotController.getDisabledTimeslots);

// Get all disabled timeslots (admin only)
router.get('/all', timeslotController.getAllDisabledTimeslots);

// Toggle timeslot (disable/enable)
router.post('/toggle', timeslotController.toggleTimeslot);

// Delete specific disabled timeslot
router.delete('/:id', timeslotController.deleteDisabledTimeslot);

// Clear old disabled timeslots
router.delete('/clear/old', timeslotController.clearOldDisabledTimeslots);

module.exports = router;
