const { promisePool } = require('../config/database');

class Treatment {
  // Get all treatments
  static async getAll() {
    const [rows] = await promisePool.query(`
      SELECT * FROM treatments 
      ORDER BY category, name ASC
    `);
    // Parse category and facilities JSON string to array
    return rows.map(row => ({
      ...row,
      category: this.parseCategory(row.category),
      facilities: this.parseFacilities(row.facilities)
    }));
  }

  // Get treatment by ID
  static async getById(id) {
    const [rows] = await promisePool.query(
      'SELECT * FROM treatments WHERE id = ?',
      [id]
    );
    if (rows[0]) {
      return {
        ...rows[0],
        category: this.parseCategory(rows[0].category),
        facilities: this.parseFacilities(rows[0].facilities)
      };
    }
    return rows[0];
  }

  // Get treatment by name
  static async getByName(name) {
    const [rows] = await promisePool.query(
      'SELECT * FROM treatments WHERE name = ?',
      [name]
    );
    return rows[0];
  }

  // Get last treatment ID
  static async getLastId() {
    const [rows] = await promisePool.query(
      'SELECT id FROM treatments ORDER BY id DESC LIMIT 1'
    );
    return rows[0];
  }

  // Helper: Convert category array to JSON string
  static stringifyCategory(category) {
    if (Array.isArray(category)) {
      return JSON.stringify(category);
    }
    if (typeof category === 'string') {
      return JSON.stringify([category]);
    }
    return JSON.stringify([]);
  }

  // Helper: Parse category JSON string to array
  static parseCategory(category) {
    if (!category) return [];
    if (Array.isArray(category)) return category;
    try {
      const parsed = JSON.parse(category);
      return Array.isArray(parsed) ? parsed : [category];
    } catch (e) {
      return [category];
    }
  }

  // Helper: Convert facilities array to JSON string
  static stringifyFacilities(facilities) {
    if (Array.isArray(facilities)) {
      return JSON.stringify(facilities);
    }
    if (typeof facilities === 'string') {
      return JSON.stringify([facilities]);
    }
    return JSON.stringify([]);
  }

  // Helper: Parse facilities JSON string to array
  static parseFacilities(facilities) {
    if (!facilities) return [];
    if (Array.isArray(facilities)) return facilities;
    try {
      const parsed = JSON.parse(facilities);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Create new treatment
  static async create(treatmentData) {
    const {
      name,
      category = [],
      duration = '60 min',
      price,
      description = '',
      image = '',
      facilities = [],
      discountPercentage = 0,
      promoStartDate = null,
      promoEndDate = null
    } = treatmentData;

    const categoryString = this.stringifyCategory(category);
    const facilitiesString = this.stringifyFacilities(facilities);
    
    // Ensure discount percentage is a valid number
    const validDiscountPercentage = parseInt(discountPercentage) || 0;
    
    // Ensure dates are properly formatted or null
    const validPromoStartDate = promoStartDate && promoStartDate !== '' ? promoStartDate : null;
    const validPromoEndDate = promoEndDate && promoEndDate !== '' ? promoEndDate : null;

    const [result] = await promisePool.query(
      `INSERT INTO treatments 
       (name, category, duration, price, description, image, facilities, discount_percentage, promo_start_date, promo_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, categoryString, duration, price, description, image, facilitiesString, validDiscountPercentage, validPromoStartDate, validPromoEndDate]
    );
    
    return { insertId: result.insertId };
  }

  // Update treatment
  static async update(id, treatmentData) {
    const {
      name,
      category,
      duration,
      price,
      description,
      image,
      facilities = [],
      discountPercentage = 0,
      promoStartDate = null,
      promoEndDate = null
    } = treatmentData;

    const categoryString = this.stringifyCategory(category);
    const facilitiesString = this.stringifyFacilities(facilities);
    
    // Ensure discount percentage is a valid number
    const validDiscountPercentage = parseInt(discountPercentage) || 0;
    
    // Ensure dates are properly formatted or null
    const validPromoStartDate = promoStartDate && promoStartDate !== '' ? promoStartDate : null;
    const validPromoEndDate = promoEndDate && promoEndDate !== '' ? promoEndDate : null;

    const [result] = await promisePool.query(
      `UPDATE treatments SET
        name = ?, category = ?, duration = ?, price = ?, 
        description = ?, image = ?, facilities = ?, discount_percentage = ?, promo_start_date = ?, promo_end_date = ?
       WHERE id = ?`,
      [name, categoryString, duration, price, description, image, facilitiesString, validDiscountPercentage, validPromoStartDate, validPromoEndDate, id]
    );
    
    return result.affectedRows;
  }

  // Delete treatment
  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM treatments WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Get treatments by category
  static async getByCategory(category) {
    const [rows] = await promisePool.query(
      `SELECT * FROM treatments 
       WHERE JSON_CONTAINS(category, ?) OR category LIKE ?
       ORDER BY name ASC`,
      [JSON.stringify(category), `%${category}%`]
    );
    return rows.map(row => ({
      ...row,
      category: this.parseCategory(row.category),
      facilities: this.parseFacilities(row.facilities)
    }));
  }

  // Get all categories
  static async getCategories() {
    const [rows] = await promisePool.query(`
      SELECT DISTINCT category 
      FROM treatments 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);
    
    // Parse all categories and create a unique set
    const allCategories = new Set();
    rows.forEach(row => {
      const categories = this.parseCategory(row.category);
      categories.forEach(cat => allCategories.add(cat));
    });
    
    return Array.from(allCategories).sort();
  }

  // Get treatment statistics
  static async getStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT category) as total_categories,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        SUM(price) as total_value
      FROM treatments
    `);
    return rows[0];
  }

  // Get category statistics
  static async getCategoryStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        category,
        COUNT(*) as treatment_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        SUM(price) as total_value
      FROM treatments
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY treatment_count DESC
    `);
    return rows;
  }

  // Get popular treatments (based on appointment count)
  static async getPopularTreatments(limit = 5) {
    const [rows] = await promisePool.query(`
      SELECT 
        t.*,
        COUNT(a.id) as appointment_count,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        COALESCE(SUM(a.amount), 0) as total_revenue
      FROM treatments t
      LEFT JOIN appointments a ON t.id = a.treatment_id
      GROUP BY t.id, t.name, t.category, t.duration, t.price, t.description, t.image
      ORDER BY appointment_count DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  // Search treatments
  static async search(searchTerm) {
    const [rows] = await promisePool.query(
      `SELECT * FROM treatments 
       WHERE name LIKE ? 
          OR category LIKE ?
          OR description LIKE ?
          OR id LIKE ?
       ORDER BY category, name`,
      [
        `%${searchTerm}%`, `%${searchTerm}%`, 
        `%${searchTerm}%`, `%${searchTerm}%`
      ]
    );
    return rows;
  }

  // Get price range
  static async getPriceRange() {
    const [rows] = await promisePool.query(`
      SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM treatments
    `);
    return rows[0];
  }

  // Get treatments with appointment statistics
  static async getWithAppointmentStats() {
    const [rows] = await promisePool.query(`
      SELECT 
        t.*,
        COUNT(a.id) as total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_appointments,
        SUM(CASE WHEN a.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_appointments,
        COALESCE(SUM(a.amount), 0) as total_revenue
      FROM treatments t
      LEFT JOIN appointments a ON t.id = a.treatment_id
      GROUP BY t.id, t.name, t.category, t.duration, t.price, t.description, t.image
      ORDER BY total_appointments DESC
    `);
    return rows;
  }
}

module.exports = Treatment;