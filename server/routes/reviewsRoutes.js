const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// PENTING: Route yang lebih spesifik harus di atas route yang umum

// GET /api/reviews/user/:userId - Get reviews by user ID (PINDAH KE ATAS)
router.get('/user/:userId', reviewsController.getReviewsByUserId);

// GET /api/reviews - Get all reviews
router.get('/', reviewsController.listReviews);

// GET /api/reviews/:id - Get review by ID (SETELAH /user/:userId)
router.get('/:id', reviewsController.getReviewById);

// POST /api/reviews - Create new review
router.post('/', reviewsController.createReview);

// PUT /api/reviews/:id - Update review
router.put('/:id', reviewsController.updateReview);

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', reviewsController.deleteReview);

module.exports = router;
