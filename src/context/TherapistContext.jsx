import React, { createContext, useContext, useState, useEffect } from 'react';

const TherapistContext = createContext();

export const useTherapists = () => {
  const context = useContext(TherapistContext);
  if (!context) {
    throw new Error('useTherapists must be used within a TherapistProvider');
  }
  return context;
};

export const TherapistProvider = ({ children }) => {
  const [therapists, setTherapists] = useState([
    {
      id: 'T001',
      name: 'Dr. Smith',
      email: 'smith@mochint.com',
      phone: '081234567801',
      status: 'active',
      joinDate: '15 Jan 2020',
      image: '👩‍⚕️',
      notes: 'Specializes in sensitive skin treatments',
      totalTreatments: 0 // Akan diupdate dari appointment
    },
    {
      id: 'T002',
      name: 'Dr. Lee',
      email: 'lee@mochint.com',
      phone: '081234567802',
      status: 'active',
      joinDate: '20 Mar 2021',
      image: '👨‍⚕️',
      notes: 'Expert in laser hair removal and skin rejuvenation',
      totalTreatments: 0 // Akan diupdate dari appointment
    },
    {
      id: 'T003',
      name: 'Dr. Brown',
      email: 'brown@mochint.com',
      phone: '081234567803',
      status: 'active',
      joinDate: '10 May 2019',
      image: '👩‍💼',
      notes: 'Focuses on anti-aging and acne treatments',
      totalTreatments: 0 // Akan diupdate dari appointment
    },
    {
      id: 'T004',
      name: 'Dr. Taylor',
      email: 'taylor@mochint.com',
      phone: '081234567804',
      status: 'active',
      joinDate: '05 Aug 2018',
      image: '👨‍⚕️',
      notes: 'Specialized in therapeutic and relaxation massage',
      totalTreatments: 0 // Akan diupdate dari appointment
    },
    {
      id: 'T005',
      name: 'Dr. Wilson',
      email: 'wilson@mochint.com',
      phone: '081234567805',
      status: 'inactive',
      joinDate: '12 Dec 2022',
      image: '👩‍⚕️',
      notes: 'Currently on leave',
      totalTreatments: 0 // Akan diupdate dari appointment
    }
  ]);

  // Function to update therapist treatments from appointments
  const updateTherapistTreatmentsFromAppointments = (appointments) => {
    if (!appointments || appointments.length === 0) return therapists;
    
    // Reset semua total treatments ke 0
    const updatedTherapists = therapists.map(therapist => ({
      ...therapist,
      totalTreatments: 0
    }));
    
    // Hitung total treatments untuk setiap therapist berdasarkan appointment yang completed
    appointments.forEach(appointment => {
      if (appointment.status === 'completed' && appointment.therapist) {
        const therapistIndex = updatedTherapists.findIndex(t => 
          t.name === appointment.therapist
        );
        
        if (therapistIndex !== -1) {
          updatedTherapists[therapistIndex].totalTreatments += 1;
        }
      }
    });
    
    return updatedTherapists;
  };

  // Function to get appointments (ini akan dipanggil dari komponen dengan appointment data)
  const syncWithAppointments = (appointments) => {
    const updatedTherapists = updateTherapistTreatmentsFromAppointments(appointments);
    setTherapists(updatedTherapists);
  };

  // Add new therapist
  const addTherapist = (therapistData) => {
    const newId = `T${String(therapists.length + 1).padStart(3, '0')}`;
    const newTherapist = {
      id: newId,
      image: '👩‍⚕️',
      totalTreatments: 0,
      status: 'active',
      joinDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      notes: '',
      ...therapistData
    };
    
    setTherapists(prev => [...prev, newTherapist]);
    return newId;
  };

  // Update therapist
  const updateTherapist = (id, updatedData) => {
    setTherapists(prev =>
      prev.map(therapist =>
        therapist.id === id ? { ...therapist, ...updatedData } : therapist
      )
    );
  };

  // Delete therapist
  const deleteTherapist = (id) => {
    setTherapists(prev => prev.filter(therapist => therapist.id !== id));
  };

  // Get therapist by ID
  const getTherapistById = (id) => {
    return therapists.find(therapist => therapist.id === id);
  };

  // Get therapist by name
  const getTherapistByName = (name) => {
    return therapists.find(therapist => therapist.name === name);
  };

  // Get active therapists
  const getActiveTherapists = () => {
    return therapists.filter(therapist => therapist.status === 'active');
  };

  // Get top therapists by total treatments
  const getTopTherapists = (limit = 3) => {
    return [...therapists]
      .filter(t => t.status === 'active')
      .sort((a, b) => b.totalTreatments - a.totalTreatments)
      .slice(0, limit);
  };

  // Increment treatment count for therapist by name
  const incrementTreatmentCount = (therapistName) => {
    setTherapists(prev =>
      prev.map(therapist => {
        if (therapist.name === therapistName) {
          return {
            ...therapist,
            totalTreatments: (therapist.totalTreatments || 0) + 1
          };
        }
        return therapist;
      })
    );
  };

  // Get therapist statistics
  const getTherapistStats = () => {
    const total = therapists.length;
    const active = therapists.filter(t => t.status === 'active').length;
    const totalTreatments = therapists.reduce((sum, therapist) => 
      sum + (therapist.totalTreatments || 0), 0);
    
    return {
      total,
      active,
      totalTreatments
    };
  };

  // Search therapists
  const searchTherapists = (searchTerm) => {
    if (!searchTerm) return therapists;
    
    const term = searchTerm.toLowerCase();
    return therapists.filter(therapist => 
      therapist.name.toLowerCase().includes(term) ||
      therapist.email.toLowerCase().includes(term) ||
      therapist.phone.includes(term) ||
      therapist.id.toLowerCase().includes(term) ||
      therapist.notes?.toLowerCase().includes(term)
    );
  };

  // Get therapists by status
  const getTherapistsByStatus = (status) => {
    if (status === 'all') return therapists;
    return therapists.filter(therapist => therapist.status === status);
  };

  return (
    <TherapistContext.Provider value={{
      // State
      therapists,
      
      // Statistics
      stats: getTherapistStats(),
      
      // CRUD Operations
      addTherapist,
      updateTherapist,
      deleteTherapist,
      
      // Get Operations
      getTherapistById,
      getTherapistByName,
      getActiveTherapists,
      getTopTherapists,
      searchTherapists,
      getTherapistsByStatus,
      
      // Sync Operations
      syncWithAppointments,
      incrementTreatmentCount,
      
      // Statistics
      getTherapistStats
    }}>
      {children}
    </TherapistContext.Provider>
  );
};