const { promisePool } = require('../config/database');

class Articles {
    // Get all articles (for admin - include all status)
    static async getAll() {
        const [rows] = await promisePool.query(`
            SELECT * FROM articles
            ORDER BY created_at DESC
        `);
        return rows;
    }

    // Get published articles only (for public)
    static async listPublished() {
        const [rows] = await promisePool.query(`
            SELECT * FROM articles
            WHERE status = 'Published'
            ORDER BY created_at DESC
        `);
        return rows;
    }

    // Get article by ID
    static async getById(id) {
        const [rows] = await promisePool.query(
            'SELECT * FROM articles WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Create new article
    static async create(articleData) {
        const { title, content, category, status, image, author } = articleData;
        const [result] = await promisePool.query(
            `INSERT INTO articles (title, content, category, status, image, author, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, content, category, status || 'Draft', image || '', author]
        );
        return this.getById(result.insertId);
    }

    // Update article
    static async update(id, articleData) {
        const { title, content, category, status, image, author } = articleData;
        await promisePool.query(
            `UPDATE articles 
             SET title = ?, content = ?, category = ?, status = ?, image = ?, author = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, content, category, status, image, author, id]
        );
        return this.getById(id);
    }

    // Update article status
    static async updateStatus(id, status) {
        await promisePool.query(
            `UPDATE articles 
             SET status = ?, updated_at = NOW()
             WHERE id = ?`,
            [status, id]
        );
        return this.getById(id);
    }

    // Delete article
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM articles WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get articles by category
    static async getByCategory(category) {
        const [rows] = await promisePool.query(
            `SELECT * FROM articles 
             WHERE category = ? AND status = 'Published'
             ORDER BY created_at DESC`,
            [category]
        );
        return rows;
    }
}

module.exports = Articles;