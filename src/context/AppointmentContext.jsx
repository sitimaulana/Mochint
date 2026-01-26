// context/AppointmentContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const AppointmentContext = createContext();

export const useAppointments = () => useContext(AppointmentContext);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([
    {
      id: 'AP001',
      memberId: 'M001',
      customer: 'Sarah Johnson',
      treatment: 'Facial Treatment',
      therapist: 'Dr. Smith',
      date: '15 Dec 2023, 10:00 AM',
      amount: '$120',
      status: 'pending',
      notes: 'Sensitive skin, needs gentle products'
    },
    {
      id: 'AP002',
      memberId: 'M002',
      customer: 'Michael Chen',
      treatment: 'Laser Hair Removal',
      therapist: 'Dr. Lee',
      date: '16 Dec 2023, 2:00 PM',
      amount: '$250',
      status: 'confirmed',
      notes: 'Second session, check reaction'
    },
    {
      id: 'AP003',
      memberId: 'M001',
      customer: 'Sarah Johnson',
      treatment: 'Skin Rejuvenation',
      therapist: 'Dr. Brown',
      date: '18 Dec 2023, 11:30 AM',
      amount: '$180',
      status: 'completed',
      notes: 'Follow-up appointment'
    },
    {
      id: 'AP004',
      memberId: 'M003',
      customer: 'Emma Wilson',
      treatment: 'Acne Treatment',
      therapist: 'Dr. Smith',
      date: '20 Dec 2023, 9:00 AM',
      amount: '$150',
      status: 'pending',
      notes: 'First consultation'
    },
    {
      id: 'AP005',
      memberId: 'M004',
      customer: 'James Miller',
      treatment: 'Body Massage',
      therapist: 'Dr. Taylor',
      date: '21 Dec 2023, 3:00 PM',
      amount: '$90',
      status: 'completed',
      notes: 'Relaxation therapy'
    }
  ]);

  // Update appointment
  const updateAppointment = (id, updatedData) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, ...updatedData } : app
    ));
  };

  // Confirm appointment
  const confirmAppointment = (id) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'confirmed' } : app
    ));
  };

  // Complete appointment with callback to update member history and therapist treatments
  const completeAppointment = (id, onCompleteCallback, onTherapistCompleteCallback) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id && app.status !== 'completed') {
        const treatmentData = {
          id: `TR${Date.now()}`,
          date: new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }) + ', ' + new Date().toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          treatment: app.treatment,
          therapist: app.therapist,
          amount: app.amount,
          notes: app.notes || 'No additional notes'
        };

        // Call the callback if provided (this will update the member's history)
        if (onCompleteCallback && app.memberId) {
          onCompleteCallback(app.memberId, treatmentData);
        }

        // Call therapist callback if provided
        if (onTherapistCompleteCallback && app.therapist) {
          onTherapistCompleteCallback(app.therapist, treatmentData);
        }

        return { 
          ...app, 
          status: 'completed',
          date: treatmentData.date // Update to current date/time
        };
      }
      return app;
    }));
  };

  // Add new appointment
  const addAppointment = (appointmentData) => {
    const newId = `AP${String(appointments.length + 1).padStart(3, '0')}`;
    const newAppointment = {
      id: newId,
      status: 'pending',
      ...appointmentData
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newId;
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  // Get appointments by memberId
  const getAppointmentsByMemberId = (memberId) => {
    return appointments.filter(app => app.memberId === memberId);
  };

  // Get appointments by therapist name
  const getAppointmentsByTherapist = (therapistName) => {
    return appointments.filter(app => app.therapist === therapistName);
  };

  // Get completed appointments by therapist name
  const getCompletedAppointmentsByTherapist = (therapistName) => {
    return appointments.filter(app => 
      app.therapist === therapistName && app.status === 'completed'
    );
  };

  // Get therapist treatment statistics
  const getTherapistStats = () => {
    const therapistMap = {};
    
    appointments.forEach(appointment => {
      if (appointment.therapist) {
        if (!therapistMap[appointment.therapist]) {
          therapistMap[appointment.therapist] = {
            name: appointment.therapist,
            totalAppointments: 0,
            completedAppointments: 0,
            pendingAppointments: 0,
            confirmedAppointments: 0
          };
        }
        
        therapistMap[appointment.therapist].totalAppointments += 1;
        
        if (appointment.status === 'completed') {
          therapistMap[appointment.therapist].completedAppointments += 1;
        } else if (appointment.status === 'pending') {
          therapistMap[appointment.therapist].pendingAppointments += 1;
        } else if (appointment.status === 'confirmed') {
          therapistMap[appointment.therapist].confirmedAppointments += 1;
        }
      }
    });
    
    return Object.values(therapistMap);
  };

  // Get top therapists by completed appointments
  const getTopTherapistsByTreatments = (limit = 5) => {
    const therapistStats = getTherapistStats();
    return therapistStats
      .filter(therapist => therapist.completedAppointments > 0)
      .sort((a, b) => b.completedAppointments - a.completedAppointments)
      .slice(0, limit);
  };

  // Get appointment statistics
  const getAppointmentStats = () => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    return { total, pending, confirmed, completed };
  };

  // Get today's appointments
  const getTodaysAppointments = () => {
    const today = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    return appointments.filter(app => app.date.startsWith(today));
  };

  // Get upcoming appointments (next 7 days)
  const getUpcomingAppointments = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return appointments.filter(app => {
      // This is a simplified filter - you might want to implement proper date parsing
      return app.status === 'confirmed' || app.status === 'pending';
    }).slice(0, 10); // Limit to 10 upcoming appointments
  };

  // Get all therapist names from appointments
  const getAllTherapistNames = () => {
    const therapistNames = new Set();
    appointments.forEach(app => {
      if (app.therapist) {
        therapistNames.add(app.therapist);
      }
    });
    return Array.from(therapistNames);
  };

  // Get therapist performance data (for charts/analytics)
  const getTherapistPerformanceData = () => {
    const therapistStats = getTherapistStats();
    return therapistStats.map(therapist => ({
      name: therapist.name,
      completed: therapist.completedAppointments,
      pending: therapist.pendingAppointments,
      confirmed: therapist.confirmedAppointments,
      completionRate: therapist.totalAppointments > 0 
        ? Math.round((therapist.completedAppointments / therapist.totalAppointments) * 100) 
        : 0
    }));
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      updateAppointment,
      confirmAppointment,
      completeAppointment,
      addAppointment,
      deleteAppointment,
      getAppointmentsByMemberId,
      getAppointmentsByTherapist,
      getCompletedAppointmentsByTherapist,
      getAppointmentStats,
      getTherapistStats,
      getTopTherapistsByTreatments,
      getTodaysAppointments,
      getUpcomingAppointments,
      getAllTherapistNames,
      getTherapistPerformanceData
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};