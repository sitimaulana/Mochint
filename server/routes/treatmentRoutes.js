const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');

// GET /api/treatments - Get all treatments
router.get('/', treatmentController.getAllTreatments);

// GET /api/treatments/categories - Get all categories
router.get('/categories', treatmentController.getCategories);

// GET /api/treatments/stats - Get treatment statistics
router.get('/stats', treatmentController.getTreatmentStats);

// GET /api/treatments/popular - Get popular treatments
router.get('/popular', treatmentController.getPopularTreatments);

// GET /api/treatments/with-stats - Get treatments with appointment stats
router.get('/with-stats', treatmentController.getTreatmentsWithStats);

// GET /api/treatments/search - Search treatments
router.get('/search', treatmentController.searchTreatments);

// GET /api/treatments/category/:category - Get treatments by category
router.get('/category/:category', treatmentController.getTreatmentsByCategory);

// GET /api/treatments/:id - Get treatment by ID
router.get('/:id', treatmentController.getTreatmentById);

// POST /api/treatments - Create new treatment
router.post('/', treatmentController.createTreatment);

// PUT /api/treatments/:id - Update treatment
router.put('/:id', treatmentController.updateTreatment);

// DELETE /api/treatments/:id - Delete treatment
router.delete('/:id', treatmentController.deleteTreatment);

module.exports = router;