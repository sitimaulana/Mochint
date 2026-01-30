import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  // API URLs - update sesuai dengan database
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
  const MEMBERS_API_URL = 'http://localhost:5000/api/members';
  const THERAPISTS_API_URL = 'http://localhost:5000/api/therapists';
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    members: true,
    therapists: true
  });
  const [error, setError] = useState(null);
  
  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading({
        appointments: true,
        members: true,
        therapists: true
      });

      const [appointmentsRes, membersRes, therapistsRes] = await Promise.all([
        axios.get(APPOINTMENTS_API_URL),
        axios.get(MEMBERS_API_URL),
        axios.get(THERAPISTS_API_URL)
      ]);

      setAppointments(appointmentsRes.data || []);
      setMembers(membersRes.data || []);
      setTherapists(therapistsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading({
        appointments: false,
        members: false,
        therapists: false
      });
    }
  };

  // Calculate appointment statistics from database data
  const calculateAppointmentStats = () => {
    const total = appointments.length;
    
    // Menggunakan data status dari database appointment
    const pending = appointments.filter(a => a.status?.toLowerCase() === 'pending').length;
    const confirmed = appointments.filter(a => a.status?.toLowerCase() === 'confirmed').length;
    const completed = appointments.filter(a => a.status?.toLowerCase() === 'completed').length;
    
    return { total, pending, confirmed, completed };
  };

  const appointmentStats = calculateAppointmentStats();
  
  // Get today's appointments - HANYA pending dan confirmed
  const getTodaysAppointments = () => {
    const today = new Date();
    // Format today's date to YYYY-MM-DD (to match database format)
    const todayStr = today.toISOString().split('T')[0];
    
    // Also get date in alternative formats for comparison
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    // Multiple possible date formats
    const possibleTodayFormats = [
      todayStr, // YYYY-MM-DD
      `${year}-${month}-${day}`, // Same as above
      `${day}/${month}/${year}`, // DD/MM/YYYY
      `${month}/${day}/${year}`, // MM/DD/YYYY
      today.toLocaleDateString('en-US'), // Local format
      today.toLocaleDateString('id-ID'), // Indonesian format
    ];
    
    return appointments.filter(app => {
      if (!app.date) return false;
      
      // FILTER: Hanya tampilkan appointment dengan status pending atau confirmed
      const status = app.status?.toLowerCase();
      if (status === 'completed') {
        return false; // Skip completed appointments
      }
      
      try {
        // Convert appointment date to string and normalize
        let appDate = app.date.toString().trim();
        
        // If it's an ISO date string (contains T)
        if (appDate.includes('T')) {
          const dateObj = new Date(appDate);
          appDate = dateObj.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
        }
        
        // Remove time part if exists
        if (appDate.includes(' ')) {
          appDate = appDate.split(' ')[0];
        }
        
        // Check if it matches any of today's formats
        return possibleTodayFormats.some(format => {
          // Compare dates in various ways
          if (appDate === format) return true;
          
          // Try to parse and compare as Date objects
          try {
            const appDateObj = new Date(appDate);
            const formatDateObj = new Date(format);
            
            if (isNaN(appDateObj.getTime()) || isNaN(formatDateObj.getTime())) {
              return false;
            }
            
            // Compare year, month, and day
            return appDateObj.getFullYear() === formatDateObj.getFullYear() &&
                   appDateObj.getMonth() === formatDateObj.getMonth() &&
                   appDateObj.getDate() === formatDateObj.getDate();
          } catch {
            return false;
          }
        });
      } catch (error) {
        console.warn('Error parsing appointment date:', app.date, error);
        return false;
      }
    });
  };

  const todayAppointments = getTodaysAppointments();
  
  // Format appointment time for display
  const formatAppointmentTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    try {
      // If time is in HH:MM format
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  // Quick action untuk update status appointment dari dashboard
  const handleQuickUpdateStatus = async (appointmentId, currentStatus) => {
    try {
      let nextStatus;
      
      if (currentStatus === 'pending') {
        nextStatus = 'confirmed';
      } else if (currentStatus === 'confirmed') {
        nextStatus = 'completed';
      } else {
        return;
      }
      
      // Update di backend
      await axios.put(`${APPOINTMENTS_API_URL}/${appointmentId}`, {
        status: nextStatus
      });
      
      // Update local state
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, status: nextStatus } : app
      ));
      
      // Refresh data untuk update dashboard
      fetchAllData();
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status');
    }
  };

  // Calculate member statistics from database data
  const calculateMemberStats = () => {
    const total = members.length;
    const active = members.filter(m => 
      m.status?.toLowerCase() === 'active'
    ).length;
    
    // Calculate total visits from appointments
    const totalVisits = appointments
      .filter(app => app.status?.toLowerCase() === 'completed')
      .filter(app => app.customer_id) // Only appointments with customer_id
      .length;

    // Calculate new members this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const newThisMonth = members.filter(member => {
      try {
        const joinDate = member.join_date || member.joinDate || member.created_at;
        if (!joinDate) return false;
        
        const dateObj = new Date(joinDate);
        return dateObj.getMonth() === currentMonth && 
               dateObj.getFullYear() === currentYear;
      } catch (error) {
        console.warn('Error parsing join date:', error);
        return false;
      }
    }).length;

    return { total, active, newThisMonth, totalVisits };
  };

  const memberStats = calculateMemberStats();
  
  // Get recent members (sorted by join date)
  const getRecentMembers = (count = 4) => {
    return [...members]
      .sort((a, b) => {
        try {
          const dateA = a.join_date || a.joinDate || a.created_at;
          const dateB = b.join_date || b.joinDate || b.created_at;
          
          if (!dateA || !dateB) return 0;
          
          const dateAObj = new Date(dateA);
          const dateBObj = new Date(dateB);
          
          if (isNaN(dateAObj.getTime()) || isNaN(dateBObj.getTime())) return 0;
          
          return dateBObj - dateAObj; // Newest first
        } catch (error) {
          return 0;
        }
      })
      .slice(0, count);
  };

  const recentMembers = getRecentMembers(4);
  
  // Get top members by visits
  const getTopMembersByVisits = (count = 4) => {
    // Create a map of member visits from appointments
    const memberVisits = {};
    
    appointments
      .filter(app => app.status?.toLowerCase() === 'completed' && app.customer_id)
      .forEach(app => {
        const memberId = app.customer_id;
        if (!memberVisits[memberId]) {
          memberVisits[memberId] = {
            memberId,
            name: app.customer_name || 'Unknown',
            visits: 0,
            email: ''
          };
        }
        memberVisits[memberId].visits++;
      });
    
    // Merge with member data for additional info
    const topMembers = Object.values(memberVisits)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, count)
      .map(memberVisit => {
        const memberFromDb = members.find(m => m.id == memberVisit.memberId);
        
        return {
          id: memberVisit.memberId,
          name: memberFromDb?.name || memberVisit.name,
          total_visits: memberVisit.visits,
          email: memberFromDb?.email || '',
          status: memberFromDb?.status || 'active'
        };
      });
    
    return topMembers;
  };

  const topMembers = getTopMembersByVisits(4);
  
  // Filter completed treatments untuk Recent Treatments
  const recentTreatments = appointments
    .filter(appointment => appointment.status?.toLowerCase() === 'completed')
    .sort((a, b) => {
      try {
        // Combine date and time for sorting
        const dateTimeA = a.date + ' ' + (a.time || '00:00');
        const dateTimeB = b.date + ' ' + (b.time || '00:00');
        
        const dateAObj = new Date(dateTimeA);
        const dateBObj = new Date(dateTimeB);
        
        if (isNaN(dateAObj.getTime()) || isNaN(dateBObj.getTime())) return 0;
        
        return dateBObj - dateAObj; // Newest first
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 5);

  // Calculate total revenue from all completed appointments
  const calculateTotalRevenue = () => {
    return appointments
      .filter(appointment => appointment.status?.toLowerCase() === 'completed')
      .reduce((total, appointment) => {
        const amount = parseFloat(appointment.amount) || 0;
        return total + amount;
      }, 0);
  };

  const totalRevenue = calculateTotalRevenue();
  
  // Format total revenue
  const formatRevenue = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formattedTotalRevenue = formatRevenue(totalRevenue);

  // Get top therapists based on completed appointments
  const getTopTherapists = (count = 3) => {
    // Hitung jumlah appointment completed per therapist
    const therapistStats = {};
    
    appointments
      .filter(app => app.status?.toLowerCase() === 'completed' && app.therapist)
      .forEach(app => {
        const therapistName = app.therapist.toString().trim();
        if (!therapistStats[therapistName]) {
          therapistStats[therapistName] = {
            name: therapistName,
            completedAppointments: 0,
            totalAppointments: 0
          };
        }
        therapistStats[therapistName].completedAppointments++;
      });

    // Hitung total appointments per therapist
    appointments
      .filter(app => app.therapist)
      .forEach(app => {
        const therapistName = app.therapist.toString().trim();
        if (therapistStats[therapistName]) {
          therapistStats[therapistName].totalAppointments++;
        }
      });

    // Convert ke array dan sort
    const sortedTherapists = Object.values(therapistStats)
      .sort((a, b) => b.completedAppointments - a.completedAppointments)
      .slice(0, count);

    // Tambahkan data dari therapist database
    return sortedTherapists.map(therapistStat => {
      const therapistFromDb = therapists.find(t => 
        t.name?.toString().trim().toLowerCase() === therapistStat.name.toLowerCase()
      );
      
      return {
        ...therapistStat,
        image: therapistFromDb?.image || '👩‍⚕️',
        status: therapistFromDb?.status || 'active',
        id: therapistFromDb?.id || therapistStat.name,
        specialty: therapistFromDb?.specialty || 'Therapist'
      };
    });
  };

  const topTherapists = getTopTherapists(3);

  // Loading state
  const isLoading = Object.values(loading).some(l => l === true);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && (appointments.length === 0 && members.length === 0 && therapists.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={memberStats.total.toString()}
          icon={UsersIcon}
          color="brown"
          subtitle={`${memberStats.active} active`}
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length.toString()}
          icon={CalendarIcon}
          color="blue"
          subtitle="Pending & Confirmed only"
        />
        <StatCard
          title="Total Visits"
          value={memberStats.totalVisits.toString()}
          icon={ChartBarIcon}
          color="green"
          subtitle={`${memberStats.newThisMonth} new this month`}
        />
        <StatCard
          title="Total Revenue"
          value={formattedTotalRevenue}
          icon={DollarIcon}
          color="orange"
          subtitle="From completed appointments"
        />
      </div>

      {/* Today's Appointments - HANYA pending dan confirmed */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Confirmed</span>
              </div>
            </div>
            <a href="/admin/appointment" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
              View All →
            </a>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{todayAppointments.length}</span> appointment{todayAppointments.length !== 1 ? 's' : ''} for today
            <span className="text-xs text-gray-500 ml-2">(Completed appointments are not shown here)</span>
          </div>
        </div>
        
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
                <div className="flex items-center flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                    appointment.status?.toLowerCase() === 'confirmed' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium text-gray-800 truncate">
                        {appointment.customer_name || 'N/A'}
                      </h3>
                      {appointment.customer_id && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                          ID: {appointment.customer_id}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                      <span className="font-medium truncate">{appointment.treatment || 'No treatment'}</span>
                      {appointment.therapist && (
                        <>
                          <span className="hidden sm:inline mx-2">•</span>
                          <span className="text-brown-600 font-medium truncate">{appointment.therapist}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {formatAppointmentTime(appointment.time)}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      appointment.status?.toLowerCase() === 'confirmed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status || 'pending'}
                    </span>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex space-x-1">
                    {appointment.status?.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleQuickUpdateStatus(appointment.id, 'pending')}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200 font-medium"
                        title="Confirm Appointment"
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status?.toLowerCase() === 'confirmed' && (
                      <button
                        onClick={() => handleQuickUpdateStatus(appointment.id, 'confirmed')}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors duration-200 font-medium"
                        title="Mark as Completed"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Appointments Today</h3>
            <p className="text-gray-500 mb-4">You don't have any pending or confirmed appointments scheduled for today.</p>
            <div className="flex justify-center space-x-3">
              <a 
                href="/admin/appointment" 
                className="inline-flex items-center px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Appointment
              </a>
              <button
                onClick={fetchAllData}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Check Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid untuk Recent Members dan Top Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Members</h2>
            <a href="/admin/member" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
                <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium text-brown-600">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{member.name || 'N/A'}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{member.email || 'No email'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-500">
                    {member.join_date ? new Date(member.join_date).toLocaleDateString('id-ID') : 'N/A'}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.status?.toLowerCase() === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status || 'inactive'}
                  </span>
                </div>
              </div>
            ))}
            {recentMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent members found
              </div>
            )}
          </div>
        </div>

        {/* Top Members by Visits */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Top Members by Visits</h2>
            <a href="/admin/member" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-4">
            {topMembers.map((member, index) => (
              <div key={member.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
                <div className="w-8 h-8 flex items-center justify-center bg-brown-100 text-brown-600 font-bold rounded-full mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{member.name || 'N/A'}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{member.email || 'No email'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">{member.total_visits || 0}</div>
                  <span className="text-xs text-gray-500">visits</span>
                </div>
              </div>
            ))}
            {topMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No treatment data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Treatments (Completed only) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Completed Treatments</h2>
          <a href="/admin/appointment" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
            View All →
          </a>
        </div>
        <div className="space-y-3">
          {recentTreatments.map((treatment) => (
            <div key={treatment.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">{treatment.customer_name || 'N/A'}</h3>
                  <span className="text-sm font-bold text-green-600">
                    Rp {(treatment.amount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                  <span>{treatment.treatment || 'N/A'}</span>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span className="text-brown-600 font-medium">{treatment.therapist || 'N/A'}</span>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span>
                    {treatment.date ? new Date(treatment.date).toLocaleDateString('id-ID') : 'N/A'}
                    {treatment.time && `, ${formatAppointmentTime(treatment.time)}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {recentTreatments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No completed treatments yet
            </div>
          )}
        </div>
      </div>

      {/* Top Therapists */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Top Therapists</h2>
          <a href="/admin/therapist" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
            View All →
          </a>
        </div>
        <div className="space-y-4">
          {topTherapists.map((therapist) => (
            <div key={therapist.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
              <div className="text-3xl mr-4">{therapist.image || '👩‍⚕️'}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{therapist.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{therapist.completedAppointments || 0} completed treatments</span>
                  {therapist.totalAppointments > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{therapist.totalAppointments} total appointments</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brown-600 mb-1">
                  {therapist.completedAppointments || 0}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  therapist.status?.toLowerCase() === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {therapist.status || 'active'}
                </span>
              </div>
            </div>
          ))}
          {topTherapists.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No therapist data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// StatCard Component dengan subtitle
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    brown: 'bg-brown-100 text-brown-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-transform duration-200 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color] || 'bg-gray-100'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// SVG Icon Components
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.645a4 4 0 00-5.197-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChartBarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const DollarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;