const Appointment = require('../models/Appointment');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get appointments',
      message: error.message 
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.getById(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get appointment',
      message: error.message 
    });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Generate ID jika tidak ada
    if (!appointmentData.id) {
      const lastAppointment = await Appointment.getLastId();
      const lastNumber = lastAppointment ? parseInt(lastAppointment.id.substring(2)) : 0;
      appointmentData.id = `AP${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    // Validasi data required
    if (!appointmentData.customer_name || !appointmentData.appointment_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer name and appointment date are required' 
      });
    }
    
    const result = await Appointment.create(appointmentData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create appointment',
      message: error.message 
    });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentData = req.body;
    
    const affectedRows = await Appointment.update(id, appointmentData);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment updated successfully' 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update appointment',
      message: error.message 
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const affectedRows = await Appointment.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete appointment',
      message: error.message 
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validasi status
    const validStatuses = ['pending', 'confirmed', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be: pending, confirmed, or completed' 
      });
    }
    
    const affectedRows = await Appointment.updateStatus(id, status);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `Appointment status updated to ${status}` 
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update appointment status',
      message: error.message 
    });
  }
};

// Complete appointment
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const appointment = await Appointment.getById(id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }
    
    // Complete appointment (this also updates therapist and member stats)
    await Appointment.complete(id);
    
    res.json({ 
      success: true, 
      message: 'Appointment completed successfully. Therapist and member stats updated.' 
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete appointment',
      message: error.message 
    });
  }
};

// Get appointments by status
exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const appointments = await Appointment.getByStatus(status);
    
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error getting appointments by status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get appointments',
      message: error.message 
    });
  }
};

// Get appointments by member
exports.getAppointmentsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const appointments = await Appointment.getByMemberId(memberId);
    
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error getting appointments by member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get appointments',
      message: error.message 
    });
  }
};

// Get today's appointments
exports.getTodayAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getTodayAppointments();
    
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error getting today appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get today appointments',
      message: error.message 
    });
  }
};

// Get upcoming appointments
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getUpcomingAppointments();
    
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get upcoming appointments',
      message: error.message 
    });
  }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.getStats();
    
    // Get revenue stats for last 30 days
    const revenueStats = await Appointment.getRevenueStats(30);
    
    res.json({ 
      success: true, 
      data: {
        ...stats,
        revenue_history: revenueStats
      }
    });
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get appointment stats',
      message: error.message 
    });
  }
};

// Search appointments
exports.searchAppointments = async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q || '';
    
    const appointments = await Appointment.search(searchTerm);
    
    res.json({ 
      success: true, 
      count: appointments.length,
      data: appointments 
    });
  } catch (error) {
    console.error('Error searching appointments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search appointments',
      message: error.message 
    });
  }
};