const { promisePool } = require('../config/database');

class Products {
    // Get all products
    static async list() {
        const [rows] = await promisePool.query(`
            SELECT * FROM products
            ORDER BY created_at DESC
        `);
        return rows;
    }

    // Get product by ID
    static async getById(id) {
        const [rows] = await promisePool.query(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Create new product
    static async create(productData) {
        const { 
            name, 
            category, 
            price, 
            weight, 
            description, 
            image, 
            marketplaceLinks,
            discountPercentage,
            promoStartDate,
            promoEndDate
        } = productData;

        const [result] = await promisePool.query(
            `INSERT INTO products 
            (name, category, price, weight, description, image, marketplace_links, discount_percentage, promo_start_date, promo_end_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                name, 
                category, 
                price, 
                weight || 0, 
                description || '', 
                image || '', 
                JSON.stringify(marketplaceLinks || {}),
                discountPercentage || 0,
                promoStartDate || null,
                promoEndDate || null
            ]
        );
        return this.getById(result.insertId);
    }

    // Update product
    static async update(id, productData) {
        const { 
            name, 
            category, 
            price, 
            weight, 
            description, 
            image, 
            marketplaceLinks,
            discountPercentage,
            promoStartDate,
            promoEndDate
        } = productData;

        await promisePool.query(
            `UPDATE products 
            SET name = ?, category = ?, price = ?, weight = ?, 
                description = ?, image = ?, marketplace_links = ?, 
                discount_percentage = ?, promo_start_date = ?, promo_end_date = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                name, 
                category, 
                price, 
                weight || 0, 
                description || '', 
                image || '', 
                JSON.stringify(marketplaceLinks || {}),
                discountPercentage || 0,
                promoStartDate || null,
                promoEndDate || null,
                id
            ]
        );
        return this.getById(id);
    }

    // Delete product
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get products by category
    static async getByCategory(category) {
        const [rows] = await promisePool.query(
            `SELECT * FROM products 
            WHERE category = ?
            ORDER BY created_at DESC`,
            [category]
        );
        return rows;
    }
}

module.exports = Products;