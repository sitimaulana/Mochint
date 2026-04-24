const Reviews = require('../models/Reviews');

exports.listReviews = async (req, res) => {
    try {
        console.log('📋 Fetching all reviews...');
        const reviews = await Reviews.list();
        console.log(`✅ Found ${reviews.length} reviews`);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('❌ Error listing reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const review = await Reviews.getById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        res.json({ success: true, data: review });
    } catch (error) {
        console.error('❌ Error getting review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewsByUserId = async (req, res) => {
    try {
        const reviews = await Reviews.getByUserId(req.params.userId);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('❌ Error getting user reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        
        console.log('➕ Received:', req.body);
        
        // VALIDASI BARU - TIDAK ADA CEK NAME!
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID wajib diisi' });
        }
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating harus 1-5' });
        }
        
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Komentar wajib diisi' });
        }
        
        const review = await Reviews.create({ userId, rating, comment: comment.trim() });
        
        console.log('✅ Review created:', review);
        
        res.status(201).json({ success: true, message: 'Review berhasil dibuat', data: review });
    } catch (error) {
        console.error('❌ Error creating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating harus 1-5' });
        }
        
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Komentar wajib diisi' });
        }
        
        const review = await Reviews.update(req.params.id, { rating, comment: comment.trim() });
        
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Review berhasil diperbarui', data: review });
    } catch (error) {
        console.error('❌ Error updating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const deleted = await Reviews.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Review berhasil dihapus' });
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

