const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articlesController');
const authenticateToken = require('../middleware/auth'); // Ubah ini sesuai dengan yang ada

// Public routes (no auth required)
router.get('/user', articlesController.getAllArticlesUser);
router.get('/:id/user', articlesController.getArticleByIdUser);
router.get('/published', articlesController.listPublishedArticles);
router.get('/category/:category', articlesController.getArticlesByCategory);

// Protected routes (auth required)
router.get('/', authenticateToken, articlesController.getAllArticles);
router.get('/:id', authenticateToken, articlesController.getArticleById);
router.post('/', authenticateToken, articlesController.createArticle);
router.put('/:id', authenticateToken, articlesController.updateArticle);
router.put('/:id/status', authenticateToken, articlesController.updateArticleStatus);
router.delete('/:id', authenticateToken, articlesController.deleteArticle);

module.exports = router;