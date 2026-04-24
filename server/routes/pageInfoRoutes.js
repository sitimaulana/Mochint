const express = require('express');
const router = express.Router();
const pageInfoController = require('../controllers/pageInfoController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes (accessible without authentication)
router.get('/public', pageInfoController.getAll);
router.get('/public/:pageType/:sectionKey', pageInfoController.getByPageAndSection);

// Protected routes (require admin authentication)
router.get('/', authenticateToken, isAdmin, pageInfoController.getAll);
router.get('/types', authenticateToken, isAdmin, pageInfoController.getPageTypes);
router.post('/', authenticateToken, isAdmin, pageInfoController.create);
router.patch('/:id/restore', authenticateToken, isAdmin, pageInfoController.restore);
router.get('/:id', authenticateToken, isAdmin, pageInfoController.getById);
router.put('/:id', authenticateToken, isAdmin, pageInfoController.update);
router.delete('/:id', authenticateToken, isAdmin, pageInfoController.delete);

module.exports = router;
