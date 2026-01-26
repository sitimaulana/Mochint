const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');

// GET /api/therapists - Get all therapists
router.get('/', therapistController.getAllTherapists);

// GET /api/therapists/active - Get active therapists
router.get('/active', therapistController.getActiveTherapists);

// GET /api/therapists/top - Get top therapists
router.get('/top', therapistController.getTopTherapists);

// GET /api/therapists/stats - Get therapist statistics
router.get('/stats', therapistController.getTherapistStats);

// GET /api/therapists/search - Search therapists
router.get('/search', therapistController.searchTherapists);

// GET /api/therapists/status/:status - Get therapists by status
router.get('/status/:status', therapistController.getTherapistsByStatus);

// GET /api/therapists/:id - Get therapist by ID
router.get('/:id', therapistController.getTherapistById);

// POST /api/therapists - Create new therapist
router.post('/', therapistController.createTherapist);

// PUT /api/therapists/:id - Update therapist
router.put('/:id', therapistController.updateTherapist);

// DELETE /api/therapists/:id - Delete therapist
router.delete('/:id', therapistController.deleteTherapist);

module.exports = router;