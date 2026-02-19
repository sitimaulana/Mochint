const { promisePool } = require('../config/database');

class Reviews {
    // Get all reviews
    static async list() {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.*,
                    m.name as member_name,
                    m.email as member_email,
                    m.address as member_address
                FROM reviews r
                LEFT JOIN members m ON r.userId = m.id
                ORDER BY r.createdAt DESC
            `);
            return rows;
        } catch (error) {
            console.error('Error in Reviews.list:', error);
            throw error;
        }
    }

    // Get review by ID
    static async getById(id) {
        try {
            const [rows] = await promisePool.query(
                'SELECT * FROM reviews WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error in Reviews.getById:', error);
            throw error;
        }
    }

    // Get reviews by user ID
    static async getByUserId(userId) {
        try {
            const [rows] = await promisePool.query(
                'SELECT * FROM reviews WHERE userId = ? ORDER BY createdAt DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error in Reviews.getByUserId:', error);
            throw error;
        }
    }

    // Create new review
    static async create(reviewData) {
        try {
            const { userId, name, email, location, rating, comment } = reviewData;
            
            const [result] = await promisePool.query(
                `INSERT INTO reviews (userId, name, email, location, rating, comment) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId || null, 
                    name, 
                    email || null, 
                    location || 'Member Terverifikasi', 
                    rating, 
                    comment
                ]
            );
            
            // Return the created review
            const [newReview] = await promisePool.query(
                'SELECT * FROM reviews WHERE id = ?',
                [result.insertId]
            );
            
            return newReview[0];
        } catch (error) {
            console.error('Error in Reviews.create:', error);
            throw error;
        }
    }

    // Update review
    static async update(id, reviewData) {
        try {
            const { rating, comment } = reviewData;
            
            await promisePool.query(
                'UPDATE reviews SET rating = ?, comment = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [rating, comment, id]
            );
            
            // Return updated review
            const [updated] = await promisePool.query(
                'SELECT * FROM reviews WHERE id = ?',
                [id]
            );
            
            return updated[0];
        } catch (error) {
            console.error('Error in Reviews.update:', error);
            throw error;
        }
    }

    // Delete review
    static async delete(id) {
        try {
            const [result] = await promisePool.query(
                'DELETE FROM reviews WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Reviews.delete:', error);
            throw error;
        }
    }
}

module.exports = Reviews;