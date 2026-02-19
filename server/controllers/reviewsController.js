const Reviews = require('../models/Reviews');

// Get all reviews
exports.listReviews = async (req, res) => {
    try {
        console.log('📋 Fetching all reviews...');
        const reviews = await Reviews.list();
        console.log(`✅ Found ${reviews.length} reviews`);
        console.log('Reviews data:', JSON.stringify(reviews, null, 2));
        
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('❌ Error listing reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list reviews',
            message: error.message
        });
    }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
    try {
        console.log('📄 Fetching review by ID:', req.params.id);
        const review = await Reviews.getById(req.params.id);
        
        if (!review) {
            console.log('❌ Review not found');
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }
        
        console.log('✅ Review found:', review);
        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('❌ Error getting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get review',
            message: error.message
        });
    }
};

// Get reviews by user ID
exports.getReviewsByUserId = async (req, res) => {
    try {
        console.log('👤 Fetching reviews for user ID:', req.params.userId);
        const reviews = await Reviews.getByUserId(req.params.userId);
        console.log(`✅ Found ${reviews.length} reviews for user`);
        
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('❌ Error getting user reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user reviews',
            message: error.message
        });
    }
};

// Create new review
exports.createReview = async (req, res) => {
    try {
        const { userId, name, email, location, rating, comment } = req.body;
        
        console.log('➕ Creating new review:', { userId, name, email, location, rating, comment });
        
        // Validation
        if (!name || !rating || !comment) {
            console.log('❌ Validation failed: missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Nama, rating, dan komentar wajib diisi'
            });
        }
        
        if (rating < 1 || rating > 5) {
            console.log('❌ Validation failed: invalid rating');
            return res.status(400).json({
                success: false,
                message: 'Rating harus antara 1-5'
            });
        }
        
        const review = await Reviews.create({
            userId,
            name,
            email,
            location,
            rating,
            comment
        });
        
        console.log('✅ Review created successfully:', review);
        
        res.status(201).json({
            success: true,
            message: 'Review berhasil dibuat',
            data: review
        });
    } catch (error) {
        console.error('❌ Error creating review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create review',
            message: error.message
        });
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        console.log('✏️ Updating review ID:', req.params.id, { rating, comment });
        
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating dan komentar wajib diisi'
            });
        }
        
        const review = await Reviews.update(req.params.id, { rating, comment });
        
        if (!review) {
            console.log('❌ Review not found for update');
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }
        
        console.log('✅ Review updated successfully:', review);
        
        res.json({
            success: true,
            message: 'Review berhasil diperbarui',
            data: review
        });
    } catch (error) {
        console.error('❌ Error updating review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update review',
            message: error.message
        });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        console.log('🗑️ Deleting review ID:', req.params.id);
        const deleted = await Reviews.delete(req.params.id);
        
        if (!deleted) {
            console.log('❌ Review not found for deletion');
            return res.status(404).json({
                success: false,
                message: 'Review tidak ditemukan'
            });
        }
        
        console.log('✅ Review deleted successfully');
        
        res.json({
            success: true,
            message: 'Review berhasil dihapus'
        });
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete review',
            message: error.message
        });
    }
};

