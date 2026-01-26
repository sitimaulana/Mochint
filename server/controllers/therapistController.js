const Therapist = require('../models/Therapist');

// Get all therapists
exports.getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.getAll();
    res.json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error getting therapists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get therapists',
      message: error.message
    });
  }
};

// Get therapist by ID
exports.getTherapistById = async (req, res) => {
  try {
    const { id } = req.params;
    const therapist = await Therapist.getById(id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        error: 'Therapist not found'
      });
    }

    res.json({ success: true, data: therapist });
  } catch (error) {
    console.error('Error getting therapist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get therapist',
      message: error.message
    });
  }
};

// Create new therapist
exports.createTherapist = async (req, res) => {
  try {
    const therapistData = req.body;

    // Generate ID jika tidak ada
    if (!therapistData.id) {
      const lastTherapist = await Therapist.getLastId();
      const lastNumber = lastTherapist ? parseInt(lastTherapist.id.substring(2)) : 0;
      therapistData.id = `TH${String(lastNumber + 1).padStart(3, '0')}`;
    }

    const result = await Therapist.create(therapistData);

    // Fetch the created therapist to return to client
    const createdTherapist = await Therapist.getById(result.id);

    res.status(201).json(createdTherapist);
  } catch (error) {
    console.error('Error creating therapist:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create therapist',
      message: error.message
    });
  }
};

// Update therapist
exports.updateTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const therapistData = req.body;

    const affectedRows = await Therapist.update(id, therapistData);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Therapist not found'
      });
    }

    // Fetch the updated therapist data to return to the client
    const updatedTherapist = await Therapist.getById(id);

    res.json(updatedTherapist);
  } catch (error) {
    console.error('Error updating therapist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update therapist',
      message: error.message
    });
  }
};

// Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await Therapist.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Therapist not found'
      });
    }

    res.json({
      success: true,
      message: 'Therapist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting therapist:', error);

    // Check if therapist has appointments
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete therapist with existing appointments'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete therapist',
      message: error.message
    });
  }
};

// Get active therapists
exports.getActiveTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.getActive();

    res.json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error getting active therapists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active therapists',
      message: error.message
    });
  }
};

// Get therapists by status
exports.getTherapistsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const therapists = await Therapist.getByStatus(status);

    res.json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error getting therapists by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get therapists',
      message: error.message
    });
  }
};

// Get top therapists
exports.getTopTherapists = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const therapists = await Therapist.getTopTherapists(parseInt(limit));

    res.json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error getting top therapists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get top therapists',
      message: error.message
    });
  }
};

// Get therapist statistics
exports.getTherapistStats = async (req, res) => {
  try {
    const stats = await Therapist.getStats();
    const specializationStats = await Therapist.getSpecializationStats();
    const performanceStats = await Therapist.getPerformanceStats();

    res.json({
      success: true,
      data: {
        ...stats,
        specializations: specializationStats,
        performance: performanceStats
      }
    });
  } catch (error) {
    console.error('Error getting therapist stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get therapist stats',
      message: error.message
    });
  }
};

// Search therapists
exports.searchTherapists = async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q || '';

    const therapists = await Therapist.search(searchTerm);

    res.json({
      success: true,
      count: therapists.length,
      data: therapists
    });
  } catch (error) {
    console.error('Error searching therapists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search therapists',
      message: error.message
    });
  }
};