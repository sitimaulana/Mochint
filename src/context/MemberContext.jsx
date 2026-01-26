// context/MemberContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const MemberContext = createContext();

export const useMembers = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMembers must be used within a MemberProvider');
  }
  return context;
};

export const MemberProvider = ({ children }) => {
  // Initial members data
  const [members, setMembers] = useState([
    {
      id: 'M001',
      name: 'Sarah Johnson',
      email: 'sarahjohnson@email.com',
      phone: '081234567890',
      joinDate: '15 Jan 2023',
      totalVisits: 3,
      status: 'active',
      lastVisit: '18 Dec 2023',
      history: [
        {
          id: 'TR001',
          date: '18 Dec 2023, 11:30 AM',
          treatment: 'Skin Rejuvenation',
          therapist: 'Dr. Brown',
          amount: '$180',
          notes: 'Follow-up appointment',
          appointmentId: 'AP003'
        },
        {
          id: 'TR002',
          date: '15 Dec 2023, 10:00 AM',
          treatment: 'Facial Treatment',
          therapist: 'Dr. Smith',
          amount: '$120',
          notes: 'Sensitive skin, needs gentle products',
          appointmentId: 'AP001'
        },
        {
          id: 'TR003',
          date: '10 Nov 2023, 2:00 PM',
          treatment: 'Acne Treatment',
          therapist: 'Dr. Smith',
          amount: '$150',
          notes: 'Initial consultation',
          appointmentId: 'AP010'
        }
      ]
    },
    {
      id: 'M002',
      name: 'Michael Chen',
      email: 'michaelchen@email.com',
      phone: '081234567891',
      joinDate: '20 Feb 2023',
      totalVisits: 2,
      status: 'active',
      lastVisit: '16 Dec 2023',
      history: [
        {
          id: 'TR004',
          date: '16 Dec 2023, 2:00 PM',
          treatment: 'Laser Hair Removal',
          therapist: 'Dr. Lee',
          amount: '$250',
          notes: 'Second session, check reaction',
          appointmentId: 'AP002'
        },
        {
          id: 'TR005',
          date: '5 Nov 2023, 11:00 AM',
          treatment: 'Skin Whitening',
          therapist: 'Dr. Lee',
          amount: '$200',
          notes: 'First session',
          appointmentId: 'AP011'
        }
      ]
    },
    {
      id: 'M003',
      name: 'Emma Wilson',
      email: 'emmawilson@email.com',
      phone: '081234567892',
      joinDate: '05 Mar 2023',
      totalVisits: 1,
      status: 'active',
      lastVisit: '20 Dec 2023',
      history: [
        {
          id: 'TR006',
          date: '20 Dec 2023, 9:00 AM',
          treatment: 'Acne Treatment',
          therapist: 'Dr. Smith',
          amount: '$150',
          notes: 'First consultation',
          appointmentId: 'AP004'
        }
      ]
    },
    {
      id: 'M004',
      name: 'James Miller',
      email: 'jamesmiller@email.com',
      phone: '081234567893',
      joinDate: '12 Apr 2023',
      totalVisits: 1,
      status: 'active',
      lastVisit: '21 Dec 2023',
      history: [
        {
          id: 'TR007',
          date: '21 Dec 2023, 3:00 PM',
          treatment: 'Body Massage',
          therapist: 'Dr. Taylor',
          amount: '$90',
          notes: 'Relaxation therapy',
          appointmentId: 'AP005'
        }
      ]
    },
    {
      id: 'M005',
      name: 'Lisa Wang',
      email: 'lisawang@email.com',
      phone: '081234567894',
      joinDate: '30 May 2023',
      totalVisits: 0,
      status: 'active',
      lastVisit: 'Never',
      history: []
    },
    {
      id: 'M006',
      name: 'David Kim',
      email: 'davidkim@email.com',
      phone: '081234567895',
      joinDate: '18 Jun 2023',
      totalVisits: 2,
      status: 'inactive',
      lastVisit: '10 Dec 2023',
      history: [
        {
          id: 'TR008',
          date: '10 Dec 2023, 4:00 PM',
          treatment: 'Facial Treatment',
          therapist: 'Dr. Brown',
          amount: '$120',
          notes: 'Monthly facial',
          appointmentId: 'AP012'
        },
        {
          id: 'TR009',
          date: '10 Nov 2023, 4:00 PM',
          treatment: 'Facial Treatment',
          therapist: 'Dr. Brown',
          amount: '$120',
          notes: 'Monthly facial',
          appointmentId: 'AP013'
        }
      ]
    }
  ]);

  // Add new member
  const addMember = (memberData) => {
    const newId = `M${String(members.length + 1).padStart(3, '0')}`;
    const newMember = {
      id: newId,
      history: [],
      totalVisits: 0,
      lastVisit: 'Never',
      status: 'active',
      joinDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      ...memberData
    };
    
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  // Update existing member
  const updateMember = (id, updatedData) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, ...updatedData } : member
      )
    );
  };

  // Delete member
  const deleteMember = (id) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  };

  // Add treatment history to member by member ID
  const addTreatmentHistory = (memberId, treatmentData) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === memberId) {
          const updatedHistory = [treatmentData, ...(member.history || [])];
          
          return {
            ...member,
            totalVisits: (member.totalVisits || 0) + 1,
            lastVisit: treatmentData.date.split(',')[0], // Extract date part
            history: updatedHistory
          };
        }
        return member;
      })
    );
  };

  // Get member by ID
  const getMemberById = (id) => {
    return members.find(member => member.id === id);
  };

  // Get member by name (case insensitive)
  const getMemberByName = (name) => {
    return members.find(member => 
      member.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Search members
  const searchMembers = (searchTerm) => {
    if (!searchTerm) return members;
    
    const term = searchTerm.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.phone.includes(term) ||
      member.id.toLowerCase().includes(term)
    );
  };

  // Get members by status
  const getMembersByStatus = (status) => {
    if (status === 'all') return members;
    return members.filter(member => member.status === status);
  };

  // Get recent members
  const getRecentMembers = (count = 5) => {
    return [...members]
      .sort((a, b) => {
        try {
          const dateA = new Date(a.joinDate.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
          const dateB = new Date(b.joinDate.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      })
      .slice(0, count);
  };

  // Get top members by visits
  const getTopMembersByVisits = (count = 5) => {
    return [...members]
      .sort((a, b) => (b.totalVisits || 0) - (a.totalVisits || 0))
      .filter(member => member.totalVisits > 0)
      .slice(0, count);
  };

  // Get member statistics
  const getMemberStats = () => {
    const total = members.length;
    const active = members.filter(member => member.status === 'active').length;
    const totalVisits = members.reduce((total, member) => total + (member.totalVisits || 0), 0);
    
    // Calculate new members this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const newThisMonth = members.filter(member => {
      try {
        const joinDate = new Date(member.joinDate.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
        return joinDate.getMonth() === currentMonth && 
               joinDate.getFullYear() === currentYear &&
               member.status === 'active';
      } catch (error) {
        return false;
      }
    }).length;

    return {
      total,
      active,
      newThisMonth,
      totalVisits
    };
  };

  // Update member's last visit
  const updateMemberLastVisit = (memberId, date) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            lastVisit: date
          };
        }
        return member;
      })
    );
  };

  // Increment member's total visits
  const incrementMemberVisits = (memberId) => {
    setMembers(prev =>
      prev.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            totalVisits: (member.totalVisits || 0) + 1
          };
        }
        return member;
      })
    );
  };

  // Filter members with appointments
  const getMembersWithAppointments = (appointments) => {
    if (!appointments || appointments.length === 0) return members;
    
    const memberIdsWithAppointments = [...new Set(appointments.map(app => app.memberId))];
    return members.filter(member => memberIdsWithAppointments.includes(member.id));
  };

  // Get member's appointment history
  const getMemberAppointmentHistory = (memberId, appointments) => {
    if (!appointments) return [];
    
    const memberAppointments = appointments.filter(app => app.memberId === memberId);
    return memberAppointments.sort((a, b) => {
      // Simple date sorting - you might want to implement proper date parsing
      return b.date.localeCompare(a.date);
    });
  };

  // Get upcoming appointments for member
  const getMemberUpcomingAppointments = (memberId, appointments) => {
    if (!appointments) return [];
    
    return appointments.filter(app => 
      app.memberId === memberId && 
      (app.status === 'pending' || app.status === 'confirmed')
    ).sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <MemberContext.Provider value={{
      // State
      members,
      
      // Statistics
      stats: getMemberStats(),
      
      // CRUD Operations
      addMember,
      updateMember,
      deleteMember,
      
      // History Operations
      addTreatmentHistory,
      updateMemberLastVisit,
      incrementMemberVisits,
      
      // Search & Get Operations
      getMemberById,
      getMemberByName,
      searchMembers,
      getMembersByStatus,
      getRecentMembers,
      getTopMembersByVisits,
      getMembersWithAppointments,
      getMemberAppointmentHistory,
      getMemberUpcomingAppointments,
      
      // Helper Functions
      getMemberStats
    }}>
      {children}
    </MemberContext.Provider>
  );
};