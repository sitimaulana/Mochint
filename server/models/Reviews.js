const { promisePool } = require('../config/database');

class Reviews {
    // Get all reviews dengan data member
    static async list() {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                ORDER BY r.createdAt DESC
            `);
            
            console.log('✅ Reviews fetched with member data:', rows);
            return rows;
        } catch (error) {
            console.error('❌ Error in Reviews.list:', error);
            throw error;
        }
    }

    // Get review by ID dengan data member
    static async getById(id) {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.id = ?
            `, [id]);
            
            return rows[0];
        } catch (error) {
            console.error('❌ Error in Reviews.getById:', error);
            throw error;
        }
    }

    // Get reviews by user ID dengan data member
    static async getByUserId(userId) {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.userId = ?
                ORDER BY r.createdAt DESC
            `, [userId]);
            
            return rows;
        } catch (error) {
            console.error('❌ Error in Reviews.getByUserId:', error);
            throw error;
        }
    }

    // Create new review - HANYA simpan userId, rating, comment
    static async create(reviewData) {
        try {
            const { userId, rating, comment } = reviewData;
            
            console.log('📝 Creating review:', { userId, rating, comment });
            
            // Validasi userId ada di table members
            const [member] = await promisePool.query(
                'SELECT id, name, address FROM members WHERE id = ?',
                [userId]
            );
            
            if (!member || member.length === 0) {
                throw new Error(`Member dengan ID ${userId} tidak ditemukan`);
            }
            
            console.log('✅ Member found:', member[0]);
            
            // Insert HANYA userId, rating, comment
            const [result] = await promisePool.query(
                `INSERT INTO reviews (userId, rating, comment) 
                 VALUES (?, ?, ?)`,
                [userId, rating, comment]
            );
            
            console.log('✅ Review inserted, ID:', result.insertId);
            
            // Fetch review baru dengan JOIN ke members
            const [newReview] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.id = ?
            `, [result.insertId]);
            
            console.log('✅ Review created with member data:', newReview[0]);
            return newReview[0];
        } catch (error) {
            console.error('❌ Error in Reviews.create:', error);
            throw error;
        }
    }

    // Update review - HANYA update rating dan comment
    static async update(id, reviewData) {
        try {
            const { rating, comment } = reviewData;
            
            console.log('📝 Updating review:', { id, rating, comment });
            
            await promisePool.query(
                'UPDATE reviews SET rating = ?, comment = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [rating, comment, id]
            );
            
            // Return updated review dengan JOIN
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Review updated:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.update:', error);
            throw error;
        }
    }

    // Delete review
    static async delete(id) {
        try {
            console.log('🗑️ Deleting review:', id);
            
            const [result] = await promisePool.query(
                'DELETE FROM reviews WHERE id = ?',
                [id]
            );
            
            console.log('✅ Review deleted, affected rows:', result.affectedRows);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Error in Reviews.delete:', error);
            throw error;
        }
    }
}

module.exports = Reviews;