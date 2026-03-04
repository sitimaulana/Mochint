const TreatmentOptions = require('../models/TreatmentOptions');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await TreatmentOptions.getCategories();
    res.json({ 
      success: true, 
      count: categories.length,
      data: categories.map(cat => cat.option_value)
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get categories',
      message: error.message 
    });
  }
};

// Get all facilities
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await TreatmentOptions.getFacilities();
    res.json({ 
      success: true, 
      count: facilities.length,
      data: facilities.map(fac => fac.option_value)
    });
  } catch (error) {
    console.error('Error getting facilities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get facilities',
      message: error.message 
    });
  }
};

// Add new category
exports.addCategory = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value || !value.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category value is required' 
      });
    }

    // Check if category already exists
    const existing = await TreatmentOptions.exists('category', value.trim());
    if (existing) {
      if (!existing.is_active) {
        // Restore if it was soft-deleted
        await TreatmentOptions.restore(existing.id);
        return res.json({ 
          success: true, 
          message: 'Category restored',
          data: value.trim()
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Category already exists' 
      });
    }

    const newCategory = await TreatmentOptions.create('category', value.trim());
    res.status(201).json({ 
      success: true, 
      message: 'Category added successfully',
      data: newCategory.option_value
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add category',
      message: error.message 
    });
  }
};

// Add new facility
exports.addFacility = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value || !value.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Facility value is required' 
      });
    }

    // Check if facility already exists
    const existing = await TreatmentOptions.exists('facility', value.trim());
    if (existing) {
      if (!existing.is_active) {
        // Restore if it was soft-deleted
        await TreatmentOptions.restore(existing.id);
        return res.json({ 
          success: true, 
          message: 'Facility restored',
          data: value.trim()
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Facility already exists' 
      });
    }

    const newFacility = await TreatmentOptions.create('facility', value.trim());
    res.status(201).json({ 
      success: true, 
      message: 'Facility added successfully',
      data: newFacility.option_value
    });
  } catch (error) {
    console.error('Error adding facility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add facility',
      message: error.message 
    });
  }
};

// Delete category (soft delete)
exports.deleteCategory = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category value is required' 
      });
    }

    const deleted = await TreatmentOptions.softDeleteByValue('category', value);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete category',
      message: error.message 
    });
  }
};

// Delete facility (soft delete)
exports.deleteFacility = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ 
        success: false, 
        error: 'Facility value is required' 
      });
    }

    const deleted = await TreatmentOptions.softDeleteByValue('facility', value);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Facility not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Facility deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete facility',
      message: error.message 
    });
  }
};
