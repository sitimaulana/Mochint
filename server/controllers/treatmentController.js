const Treatment = require('../models/Treatment');

// Get all treatments
exports.getAllTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.getAll();
    res.json({ 
      success: true, 
      count: treatments.length,
      data: treatments 
    });
  } catch (error) {
    console.error('Error getting treatments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get treatments',
      message: error.message 
    });
  }
};

// Get treatment by ID
exports.getTreatmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const treatment = await Treatment.getById(id);
    
    if (!treatment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Treatment not found' 
      });
    }
    
    res.json({ success: true, data: treatment });
  } catch (error) {
    console.error('Error getting treatment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get treatment',
      message: error.message 
    });
  }
};

// Create new treatment
exports.createTreatment = async (req, res) => {
  try {
    const treatmentData = req.body;
    
    // Validasi data required
    if (!treatmentData.name || !treatmentData.price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Treatment name and price are required' 
      });
    }
    
    // Sanitize dates - convert empty strings to null
    if (treatmentData.promoStartDate === '' || treatmentData.promoStartDate === undefined) {
      treatmentData.promoStartDate = null;
    }
    if (treatmentData.promoEndDate === '' || treatmentData.promoEndDate === undefined) {
      treatmentData.promoEndDate = null;
    }
    
    const result = await Treatment.create(treatmentData);
    
    // Return created treatment data
    const createdTreatment = await Treatment.getById(result.insertId);
    
    res.status(201).json({ 
      success: true, 
      message: 'Treatment created successfully',
      data: createdTreatment
    });
  } catch (error) {
    console.error('Error creating treatment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create treatment',
      message: error.message 
    });
  }
};

// Update treatment
exports.updateTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const treatmentData = req.body;
    
    // Sanitize dates - convert empty strings to null
    if (treatmentData.promoStartDate === '' || treatmentData.promoStartDate === undefined) {
      treatmentData.promoStartDate = null;
    }
    if (treatmentData.promoEndDate === '' || treatmentData.promoEndDate === undefined) {
      treatmentData.promoEndDate = null;
    }
    
    // Log untuk debugging
    console.log('Updating treatment:', id);
    console.log('Treatment data:', JSON.stringify(treatmentData, null, 2));
    
    const affectedRows = await Treatment.update(id, treatmentData);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Treatment not found' 
      });
    }
    
    // Return updated treatment data
    const updatedTreatment = await Treatment.getById(id);
    
    res.json({ 
      success: true, 
      message: 'Treatment updated successfully',
      data: updatedTreatment 
    });
  } catch (error) {
    console.error('Error updating treatment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update treatment',
      message: error.message 
    });
  }
};

// Delete treatment
exports.deleteTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affectedRows = await Treatment.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Treatment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Treatment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    
    // Check if treatment has appointments
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete treatment with existing appointments' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete treatment',
      message: error.message 
    });
  }
};

// Get treatments by category
exports.getTreatmentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const treatments = await Treatment.getByCategory(category);
    
    res.json({ 
      success: true, 
      count: treatments.length,
      data: treatments 
    });
  } catch (error) {
    console.error('Error getting treatments by category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get treatments',
      message: error.message 
    });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Treatment.getCategories();
    
    res.json({ 
      success: true, 
      count: categories.length,
      data: categories 
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

// Get treatment statistics
exports.getTreatmentStats = async (req, res) => {
  try {
    const stats = await Treatment.getStats();
    const categoryStats = await Treatment.getCategoryStats();
    const priceRange = await Treatment.getPriceRange();
    const popularTreatments = await Treatment.getPopularTreatments(5);
    
    res.json({ 
      success: true, 
      data: {
        ...stats,
        price_range: priceRange,
        categories: categoryStats,
        popular_treatments: popularTreatments
      }
    });
  } catch (error) {
    console.error('Error getting treatment stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get treatment stats',
      message: error.message 
    });
  }
};

// Get popular treatments
exports.getPopularTreatments = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const treatments = await Treatment.getPopularTreatments(parseInt(limit));
    
    res.json({ 
      success: true, 
      count: treatments.length,
      data: treatments 
    });
  } catch (error) {
    console.error('Error getting popular treatments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get popular treatments',
      message: error.message 
    });
  }
};

// Search treatments
exports.searchTreatments = async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q || '';
    
    const treatments = await Treatment.search(searchTerm);
    
    res.json({ 
      success: true, 
      count: treatments.length,
      data: treatments 
    });
  } catch (error) {
    console.error('Error searching treatments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search treatments',
      message: error.message 
    });
  }
};

// Get treatments with appointment statistics
exports.getTreatmentsWithStats = async (req, res) => {
  try {
    const treatments = await Treatment.getWithAppointmentStats();
    
    res.json({ 
      success: true, 
      count: treatments.length,
      data: treatments 
    });
  } catch (error) {
    console.error('Error getting treatments with stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get treatments',
      message: error.message 
    });
  }
};