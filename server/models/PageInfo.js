const { promisePool } = require('../config/database');

class PageInfo {
  // Get all page information or filter by page type
  static async getAll(pageType = null, includeInactive = false) {
    try {
      let query = 'SELECT * FROM page_information';
      const params = [];
      const conditions = [];
      
      if (!includeInactive) {
        conditions.push('is_active = 1');
      }
      
      if (pageType) {
        conditions.push('page_type = ?');
        params.push(pageType);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY display_order ASC';
      
      const [rows] = await promisePool.query(query, params);
      
      // Parse JSON fields safely
      return rows.map(row => ({
        ...row,
        additional_data: row.additional_data ? 
          (typeof row.additional_data === 'string' ? JSON.parse(row.additional_data) : row.additional_data) 
          : null
      }));
    } catch (error) {
      console.error('Error in PageInfo.getAll:', error);
      throw error;
    }
  }

  // Get page information by page type and section key
  static async getByPageAndSection(pageType, sectionKey) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM page_information WHERE page_type = ? AND section_key = ? AND is_active = 1',
        [pageType, sectionKey]
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        ...row,
        additional_data: row.additional_data ? 
          (typeof row.additional_data === 'string' ? JSON.parse(row.additional_data) : row.additional_data) 
          : null
      };
    } catch (error) {
      console.error('Error in PageInfo.getByPageAndSection:', error);
      throw error;
    }
  }

  // Get by ID
  static async getById(id) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM page_information WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        ...row,
        additional_data: row.additional_data ? 
          (typeof row.additional_data === 'string' ? JSON.parse(row.additional_data) : row.additional_data) 
          : null
      };
    } catch (error) {
      console.error('Error in PageInfo.getById:', error);
      throw error;
    }
  }

  // Create new page information
  static async create(data) {
    try {
      const {
        page_type,
        section_key,
        title,
        subtitle,
        content,
        image_url,
        additional_data,
        is_active = true,
        display_order = 0
      } = data;

      const additionalDataJson = additional_data ? JSON.stringify(additional_data) : null;

      const [result] = await promisePool.query(
        `INSERT INTO page_information 
        (page_type, section_key, title, subtitle, content, image_url, additional_data, is_active, display_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [page_type, section_key, title, subtitle, content, image_url, additionalDataJson, is_active, display_order]
      );

      return this.getById(result.insertId);
    } catch (error) {
      console.error('Error in PageInfo.create:', error);
      throw error;
    }
  }

  // Update page information
  static async update(id, data) {
    try {
      const {
        page_type,
        section_key,
        title,
        subtitle,
        content,
        image_url,
        additional_data,
        is_active,
        display_order
      } = data;

      const additionalDataJson = additional_data ? JSON.stringify(additional_data) : null;

      await promisePool.query(
        `UPDATE page_information 
        SET page_type = ?, section_key = ?, title = ?, subtitle = ?, content = ?, 
            image_url = ?, additional_data = ?, is_active = ?, display_order = ?
        WHERE id = ?`,
        [page_type, section_key, title, subtitle, content, image_url, additionalDataJson, is_active, display_order, id]
      );

      return this.getById(id);
    } catch (error) {
      console.error('Error in PageInfo.update:', error);
      throw error;
    }
  }

  // Delete page information (soft delete by setting is_active to false)
  static async delete(id) {
    try {
      await promisePool.query(
        'UPDATE page_information SET is_active = 0 WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error in PageInfo.delete:', error);
      throw error;
    }
  }

  // Hard delete
  static async hardDelete(id) {
    try {
      await promisePool.query(
        'DELETE FROM page_information WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error in PageInfo.hardDelete:', error);
      throw error;
    }
  }

  // Restore (reactivate) page information
  static async restore(id) {
    try {
      await promisePool.query(
        'UPDATE page_information SET is_active = 1 WHERE id = ?',
        [id]
      );
      return this.getById(id);
    } catch (error) {
      console.error('Error in PageInfo.restore:', error);
      throw error;
    }
  }

  // Get all page types
  static async getPageTypes() {
    return ['home', 'about', 'promo'];
  }
}

module.exports = PageInfo;
