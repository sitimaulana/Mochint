const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /api/appointments - Get all appointments
router.get('/', appointmentController.getAllAppointments);

// GET /api/appointments/stats - Get appointment statistics
router.get('/stats', appointmentController.getAppointmentStats);

// GET /api/appointments/today - Get today's appointments
router.get('/today', appointmentController.getTodayAppointments);

// GET /api/appointments/upcoming - Get upcoming appointments
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// GET /api/appointments/search - Search appointments
router.get('/search', appointmentController.searchAppointments);

// GET /api/appointments/status/:status - Get appointments by status
router.get('/status/:status', appointmentController.getAppointmentsByStatus);

// GET /api/appointments/member/:memberId - Get appointments by member
router.get('/member/:memberId', appointmentController.getAppointmentsByMember);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments - Create new appointment
router.post('/', appointmentController.createAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', appointmentController.updateAppointment);

// PUT /api/appointments/:id/status - Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// PUT /api/appointments/:id/complete - Complete appointment
router.put('/:id/complete', appointmentController.completeAppointment);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;