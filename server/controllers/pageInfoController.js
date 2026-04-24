const PageInfo = require('../models/PageInfo');

class PageInfoController {
  // Get all page information or filter by page type
  async getAll(req, res) {
    try {
      const { page_type, include_inactive } = req.query;
      const includeInactive = include_inactive === 'true';
      const pageInfo = await PageInfo.getAll(page_type, includeInactive);
      
      res.status(200).json({
        success: true,
        data: pageInfo
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal mengambil data informasi halaman',
        details: error.message
      });
    }
  }

  // Get page information by page type and section key
  async getByPageAndSection(req, res) {
    try {
      const { pageType, sectionKey } = req.params;
      const pageInfo = await PageInfo.getByPageAndSection(pageType, sectionKey);
      
      if (!pageInfo) {
        return res.status(404).json({
          success: false,
          error: 'Data tidak ditemukan'
        });
      }
      
      res.status(200).json({
        success: true,
        data: pageInfo
      });
    } catch (error) {
      console.error('Error in getByPageAndSection:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal mengambil data informasi',
        details: error.message
      });
    }
  }

  // Get by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pageInfo = await PageInfo.getById(id);
      
      if (!pageInfo) {
        return res.status(404).json({
          success: false,
          error: 'Data tidak ditemukan'
        });
      }
      
      res.status(200).json({
        success: true,
        data: pageInfo
      });
    } catch (error) {
      console.error('Error in getById:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal mengambil data informasi',
        details: error.message
      });
    }
  }

  // Create new page information
  async create(req, res) {
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
      } = req.body;

      // Validation
      if (!page_type || !section_key) {
        return res.status(400).json({
          success: false,
          error: 'Tipe halaman dan kunci section harus diisi'
        });
      }

      const newPageInfo = await PageInfo.create({
        page_type,
        section_key,
        title,
        subtitle,
        content,
        image_url,
        additional_data,
        is_active,
        display_order
      });

      res.status(201).json({
        success: true,
        message: 'Informasi halaman berhasil dibuat',
        data: newPageInfo
      });
    } catch (error) {
      console.error('Error in create:', error);
      
      // Handle duplicate key error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'Kombinasi tipe halaman dan kunci section sudah ada'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Gagal membuat informasi halaman',
        details: error.message
      });
    }
  }

  // Update page information
  async update(req, res) {
    try {
      const { id } = req.params;
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
      } = req.body;

      // Check if exists
      const existing = await PageInfo.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Data tidak ditemukan'
        });
      }

      const updatedPageInfo = await PageInfo.update(id, {
        page_type,
        section_key,
        title,
        subtitle,
        content,
        image_url,
        additional_data,
        is_active,
        display_order
      });

      res.status(200).json({
        success: true,
        message: 'Informasi halaman berhasil diupdate',
        data: updatedPageInfo
      });
    } catch (error) {
      console.error('Error in update:', error);
      
      // Handle duplicate key error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'Kombinasi tipe halaman dan kunci section sudah ada'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Gagal mengupdate informasi halaman',
        details: error.message
      });
    }
  }

  // Delete (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if exists
      const existing = await PageInfo.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Data tidak ditemukan'
        });
      }

      await PageInfo.delete(id);

      res.status(200).json({
        success: true,
        message: 'Informasi halaman berhasil dihapus'
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal menghapus informasi halaman',
        details: error.message
      });
    }
  }

  // Get page types
  async getPageTypes(req, res) {
    try {
      const pageTypes = await PageInfo.getPageTypes();
      
      res.status(200).json({
        success: true,
        data: pageTypes
      });
    } catch (error) {
      console.error('Error in getPageTypes:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal mengambil tipe halaman',
        details: error.message
      });
    }
  }

  // Restore (reactivate) page information
  async restore(req, res) {
    try {
      const { id } = req.params;
      
      // Check if exists
      const existing = await PageInfo.getById(id);
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Data tidak ditemukan'
        });
      }

      const restoredPageInfo = await PageInfo.restore(id);

      res.status(200).json({
        success: true,
        message: 'Informasi halaman berhasil dipulihkan',
        data: restoredPageInfo
      });
    } catch (error) {
      console.error('Error in restore:', error);
      res.status(500).json({
        success: false,
        error: 'Gagal memulihkan informasi halaman',
        details: error.message
      });
    }
  }
}

module.exports = new PageInfoController();
