import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  // API URLs
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

      setAppointments(appointmentsRes.data);
      setMembers(membersRes.data);
      setTherapists(therapistsRes.data);
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
    const completed = appointments.filter(a => a.status === 'completed').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    
    return { total, completed, confirmed, pending };
  };

  const appointmentStats = calculateAppointmentStats();
  
  // Get today's appointments
  const getTodaysAppointments = () => {
    const today = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    return appointments.filter(app => {
      // Format date untuk match dengan format di database
      const appDate = app.date ? app.date.split(',')[0]?.trim() : '';
      return appDate === today;
    });
  };

  const todayAppointments = getTodaysAppointments();
  
  // Calculate member statistics from database data
  const calculateMemberStats = () => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const totalVisits = members.reduce((sum, member) => sum + (parseInt(member.total_visits) || 0), 0);
    
    // Calculate new members this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const newThisMonth = members.filter(member => {
      try {
        if (!member.join_date) return false;
        const joinDate = new Date(member.join_date.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
        return joinDate.getMonth() === currentMonth && 
               joinDate.getFullYear() === currentYear;
      } catch (error) {
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
          if (!a.join_date || !b.join_date) return 0;
          const dateA = new Date(a.join_date.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
          const dateB = new Date(b.join_date.replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'));
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      })
      .slice(0, count);
  };

  const recentMembers = getRecentMembers(4);
  
  // Get top members by visits
  const getTopMembersByVisits = (count = 4) => {
    return [...members]
      .sort((a, b) => (parseInt(b.total_visits) || 0) - (parseInt(a.total_visits) || 0))
      .filter(member => (parseInt(member.total_visits) || 0) > 0)
      .slice(0, count);
  };

  const topMembers = getTopMembersByVisits(4);
  
  // Filter completed treatments untuk Recent Treatments
  const recentTreatments = appointments
    .filter(appointment => appointment.status === 'completed')
    .sort((a, b) => {
      try {
        const dateA = new Date(a.date || a.created_at);
        const dateB = new Date(b.date || b.created_at);
        return dateB - dateA;
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 5);

  // Calculate total revenue from all completed appointments
  const calculateTotalRevenue = () => {
    return appointments
      .filter(appointment => appointment.status === 'completed')
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
      .filter(app => app.status === 'completed' && app.therapist)
      .forEach(app => {
        const therapistName = app.therapist;
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
        const therapistName = app.therapist;
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
      const therapistFromDb = therapists.find(t => t.name === therapistStat.name);
      
      return {
        ...therapistStat,
        image: therapistFromDb?.image || '👩‍⚕️',
        status: therapistFromDb?.status || 'active',
        id: therapistFromDb?.id || therapistStat.name,
        total_treatments: therapistFromDb?.total_treatments || 0
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

  if (error && (appointments.length === 0 || members.length === 0)) {
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
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchAllData}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
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
          title="Total Appointments"
          value={appointmentStats.total.toString()}
          icon={CalendarIcon}
          color="blue"
          subtitle={`${appointmentStats.completed} completed`}
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

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardMini
          value={appointmentStats.pending.toString()}
          label="Pending"
          color="yellow"
        />
        <StatCardMini
          value={appointmentStats.confirmed.toString()}
          label="Confirmed"
          color="blue"
        />
        <StatCardMini
          value={appointmentStats.completed.toString()}
          label="Completed"
          color="green"
        />
        <StatCardMini
          value={todayAppointments.length.toString()}
          label="Today's Appointments"
          color="brown"
        />
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{todayAppointments.length} appointments</span>
            <a href="/admin/appointment" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
              View All →
            </a>
          </div>
        </div>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center flex-1">
                  <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                    appointment.status === 'completed' ? 'bg-green-500' :
                    appointment.status === 'confirmed' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {appointment.customer_name || appointment.customer || 'N/A'}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                      <span className="truncate">{appointment.treatment || 'No treatment'}</span>
                      {appointment.therapist && (
                        <>
                          <span className="hidden sm:inline mx-1">•</span>
                          <span className="text-brown-600">{appointment.therapist}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-medium text-gray-800">
                    {appointment.time || 'No time'}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status || 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No appointments scheduled for today
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Join Date</th>
                  <th className="pb-3 font-medium">Visits</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-brown-600">
                            {member.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{member.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{member.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{member.join_date || 'N/A'}</td>
                    <td className="py-3 text-sm font-medium">{member.total_visits || 0}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status || 'inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <span>{member.total_visits || 0} treatments</span>
                    <span className="mx-1">•</span>
                    <span className="text-brown-600">{member.email || ''}</span>
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

      {/* Recent Treatments */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Treatments</h2>
          <a href="/admin/appointment" className="text-sm text-brown-600 hover:text-brown-700 font-medium">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Treatment</th>
                <th className="pb-3 font-medium">Therapist</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTreatments.map((treatment) => (
                <tr key={treatment.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 text-sm font-medium">
                    {treatment.customer_name || treatment.customer || 'N/A'}
                  </td>
                  <td className="py-3 text-sm">{treatment.treatment || 'N/A'}</td>
                  <td className="py-3 text-sm text-brown-600">{treatment.therapist || 'N/A'}</td>
                  <td className="py-3 text-sm text-gray-500">
                    {treatment.date ? `${treatment.date}` : 'N/A'}
                  </td>
                  <td className="py-3 text-sm font-medium text-green-600">
                    {treatment.amount ? `Rp ${parseFloat(treatment.amount).toLocaleString('id-ID')}` : 'Rp 0'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      treatment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      treatment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {treatment.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTreatments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No completed treatments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  therapist.status === 'active' 
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

// StatCard Component with subtitle
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    brown: 'bg-brown-100 text-brown-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-transform duration-200 hover:transform hover:scale-[1.02]">
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

// Mini StatCard Component
const StatCardMini = ({ value, label, color }) => {
  const colorClasses = {
    brown: 'bg-brown-50 border-brown-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  };

  const textColorClasses = {
    brown: 'text-brown-800',
    green: 'text-green-800',
    blue: 'text-blue-800',
    yellow: 'text-yellow-800'
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color] || 'bg-gray-50 border-gray-200'} transition-colors duration-200`}>
      <div className="text-center">
        <div className={`text-2xl font-bold ${textColorClasses[color] || 'text-gray-800'}`}>{value}</div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
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