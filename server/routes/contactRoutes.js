const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes (accessible without authentication)
router.get('/public', contactController.get);

// Protected routes (require admin authentication)
router.get('/', authenticateToken, isAdmin, contactController.get);
router.put('/', authenticateToken, isAdmin, contactController.update);

module.exports = router;
