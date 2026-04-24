const express = require('express');
const router = express.Router();
const treatmentOptionsController = require('../controllers/treatmentOptionsController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all categories
router.get('/categories', authenticateToken, treatmentOptionsController.getCategories);

// Get all facilities
router.get('/facilities', authenticateToken, treatmentOptionsController.getFacilities);

// Add new category (admin only)
router.post('/categories', authenticateToken, isAdmin, treatmentOptionsController.addCategory);

// Add new facility (admin only)
router.post('/facilities', authenticateToken, isAdmin, treatmentOptionsController.addFacility);

// Delete category (admin only)
router.delete('/categories', authenticateToken, isAdmin, treatmentOptionsController.deleteCategory);

// Delete facility (admin only)
router.delete('/facilities', authenticateToken, isAdmin, treatmentOptionsController.deleteFacility);

module.exports = router;
