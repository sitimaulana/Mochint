import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
  const MEMBERS_API_URL = 'http://localhost:5000/api/members';
  const THERAPISTS_API_URL = 'http://localhost:5000/api/therapists';

  const Token = localStorage.getItem('token');

  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    members: true,
    therapists: true
  });
  const [error, setError] = useState(null);

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
        axios.get(APPOINTMENTS_API_URL, { headers: { Authorization: `Bearer ${Token}` } }),
        axios.get(MEMBERS_API_URL, { headers: { Authorization: `Bearer ${Token}` } }),
        axios.get(THERAPISTS_API_URL, { headers: { Authorization: `Bearer ${Token}` } })
      ]);

      setAppointments(appointmentsRes.data.data || []);
      setMembers(membersRes.data.data || []);
      setTherapists(therapistsRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error mengambil data dashboard:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading({
        appointments: false,
        members: false,
        therapists: false
      });
    }
  };

  const calculateAppointmentStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a?.status?.toLowerCase() === 'confirmed').length;
    const completed = appointments.filter(a => a?.status?.toLowerCase() === 'completed').length;
    return { total, confirmed, completed };
  };

  const appointmentStats = calculateAppointmentStats();

  const getTodaysAppointments = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    const possibleTodayFormats = [
      todayStr,
      `${year}-${month}-${day}`,
      `${day}/${month}/${year}`,
      `${month}/${day}/${year}`,
      today.toLocaleDateString('en-US'),
      today.toLocaleDateString('id-ID'),
    ];

    return appointments.filter(app => {
      if (!app.date) return false;

      const status = app.status?.toLowerCase();
      if (status === 'completed') {
        return false;
      }

      try {
        let appDate = app.date.toString().trim();

        if (appDate.includes('T')) {
          const dateObj = new Date(appDate);
          appDate = dateObj.toISOString().split('T')[0];
        }

        if (appDate.includes(' ')) {
          appDate = appDate.split(' ')[0];
        }

        return possibleTodayFormats.some(format => {
          if (appDate === format) return true;

          try {
            const appDateObj = new Date(appDate);
            const formatDateObj = new Date(format);

            if (isNaN(appDateObj.getTime()) || isNaN(formatDateObj.getTime())) {
              return false;
            }

            return appDateObj.getFullYear() === formatDateObj.getFullYear() &&
              appDateObj.getMonth() === formatDateObj.getMonth() &&
              appDateObj.getDate() === formatDateObj.getDate();
          } catch {
            return false;
          }
        });
      } catch (error) {
        console.warn('Error parsing tanggal appointment:', app.date, error);
        return false;
      }
    });
  };

  const todayAppointments = getTodaysAppointments();

  const formatAppointmentTime = (timeStr) => {
    if (!timeStr) return 'T/A';

    try {
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

  const handleQuickUpdateStatus = async (appointmentId, currentStatus) => {
    try {
      let nextStatus;

      if (currentStatus === 'confirmed') {
        nextStatus = 'completed';
      } else {
        return;
      }

      await axios.put(`${APPOINTMENTS_API_URL}/${appointmentId}`, {
        status: nextStatus
      });

      setAppointments(prev => prev.map(app =>
        app.id === appointmentId ? { ...app, status: nextStatus } : app
      ));

      fetchAllData();

    } catch (err) {
      console.error('Error memperbarui status appointment:', err);
      alert('Gagal memperbarui status appointment');
    }
  };

  const calculateMemberStats = () => {
    const total = members.length;
    const active = members.filter(m => m.status?.toLowerCase() === 'active').length;

    const totalVisits = appointments
      .filter(app => app.status?.toLowerCase() === 'completed')
      .filter(app => app.member_id)
      .length;

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
        console.warn('Error parsing tanggal bergabung:', error);
        return false;
      }
    }).length;

    return { total, active, newThisMonth, totalVisits };
  };

  const memberStats = calculateMemberStats();

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

          return dateBObj - dateAObj;
        } catch (error) {
          return 0;
        }
      })
      .slice(0, count);
  };

  const recentMembers = getRecentMembers(4);

  const getTopMembersByVisits = (count = 4) => {
    const memberVisits = {};

    appointments
      .filter(app => app.status?.toLowerCase() === 'completed' && app.member_id)
      .forEach(app => {
        const memberId = app.member_id;
        if (!memberVisits[memberId]) {
          memberVisits[memberId] = {
            memberId,
            name: app.customer_name || 'Tidak Diketahui',
            visits: 0,
            email: ''
          };
        }
        memberVisits[memberId].visits++;
      });

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

  const recentTreatments = appointments
    .filter(appointment => appointment.status?.toLowerCase() === 'completed')
    .sort((a, b) => {
      try {
        const dateTimeA = a.date + ' ' + (a.time || '00:00');
        const dateTimeB = b.date + ' ' + (b.time || '00:00');

        const dateAObj = new Date(dateTimeA);
        const dateBObj = new Date(dateTimeB);

        if (isNaN(dateAObj.getTime()) || isNaN(dateBObj.getTime())) return 0;

        return dateBObj - dateAObj;
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 5);

    console.log(recentTreatments);
    

  const calculateTotalRevenue = () => {
    return appointments
      .filter(appointment => appointment.status?.toLowerCase() === 'completed')
      .reduce((total, appointment) => {
        const amount = parseFloat(appointment.amount) || 0;
        return total + amount;
      }, 0);
  };

  const totalRevenue = calculateTotalRevenue();

  const formatRevenue = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formattedTotalRevenue = formatRevenue(totalRevenue);

  const getTopTherapists = (count = 3) => {
    const therapistStats = {};

    // Hitung completed appointments per terapis
    appointments
      .filter(app => app.status?.toLowerCase() === 'completed')
      .forEach(app => {
        // Support both therapist and therapist_name fields
        const therapistName = (app.therapist_name || app.therapist)?.toString().trim();
        
        if (therapistName) {
          if (!therapistStats[therapistName]) {
            therapistStats[therapistName] = {
              name: therapistName,
              completedAppointments: 0,
              totalAppointments: 0
            };
          }
          therapistStats[therapistName].completedAppointments++;
        }
      });

    // Hitung total appointments per terapis (semua status)
    appointments.forEach(app => {
      // Support both therapist and therapist_name fields
      const therapistName = (app.therapist_name || app.therapist)?.toString().trim();
      
      if (therapistName && therapistStats[therapistName]) {
        therapistStats[therapistName].totalAppointments++;
      }
    });

    // Sort by completed appointments (terbanyak ke tersedikit)
    const sortedTherapists = Object.values(therapistStats)
      .sort((a, b) => b.completedAppointments - a.completedAppointments)
      .slice(0, count);

    // Map dengan data terapis dari database
    return sortedTherapists.map(therapistStat => {
      const therapistFromDb = therapists.find(t =>
        t.name?.toString().trim().toLowerCase() === therapistStat.name.toLowerCase()
      );

      return {
        ...therapistStat,
        image: therapistFromDb?.image || '👩‍⚕️',
        status: therapistFromDb?.status || 'active',
        id: therapistFromDb?.id || therapistStat.name,
        specialty: therapistFromDb?.specialty || 'Terapis'
      };
    });
  };

  const topTherapists = getTopTherapists(3);

  const isLoading = Object.values(loading).some(l => l === true);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Memuat Dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Beranda</h1>
          <p className="text-sm sm:text-base text-gray-600">Selamat datang kembali! Ini yang terjadi hari ini.</p>
        </div>
        <button
          onClick={fetchAllData}
          className="px-3 sm:px-4 py-2 bg-brown-600 text-white text-sm sm:text-base rounded-lg hover:bg-brown-700 transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Segarkan Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Anggota"
          value={memberStats.total.toString()}
          icon={UsersIcon}
          color="brown"
          subtitle={`${memberStats.active} aktif`}
        />
        <StatCard
          title="Janji Temu Hari Ini"
          value={todayAppointments.length.toString()}
          icon={CalendarIcon}
          color="brown"
          subtitle="Hanya confirmed"
        />
        <StatCard
          title="Total Kunjungan"
          value={memberStats.totalVisits.toString()}
          icon={ChartBarIcon}
          color="brown"
          subtitle={`${memberStats.newThisMonth} baru bulan ini`}
        />
        <StatCard
          title="Total Pendapatan"
          value={formattedTotalRevenue}
          icon={DollarIcon}
          color="brown"
          subtitle="Dari janji temu selesai"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Janji Temu Hari Ini</h2>
          <a href="/admin/appointment" className="text-xs sm:text-sm text-brown-600 hover:text-brown-700 font-medium">
            Lihat Semua →
          </a>
        </div>

        <div className="mb-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Menampilkan <span className="font-bold">{todayAppointments.length}</span> janji temu untuk hari ini
            <span className="text-[10px] sm:text-xs text-gray-500 block sm:inline sm:ml-2">(Janji temu yang selesai tidak ditampilkan)</span>
          </div>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 gap-3">
                <div className="flex items-start sm:items-center flex-1 min-w-0">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1 sm:mt-0 mr-2 sm:mr-3 flex-shrink-0 ${appointment.status?.toLowerCase() === 'confirmed' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-1 gap-1 sm:gap-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">
                        {appointment.customer_name || 'T/A'}
                      </h3>
                      {appointment.member_id && (
                        <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded sm:ml-2 w-fit">
                          ID: {appointment.member_id}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-xs sm:text-sm text-gray-500 space-y-0.5 sm:space-y-0">
                      <span className="font-medium truncate">{appointment.treatment || 'Tidak ada perawatan'}</span>
                      {appointment.therapist && (
                        <span className="text-brown-600 font-medium truncate">{appointment.therapist}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 sm:ml-4 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm font-medium text-gray-800">
                      {formatAppointmentTime(appointment.time)}
                    </div>
                    <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
                      appointment.status?.toLowerCase() === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {appointment.status || 'confirmed'}
                    </span>
                  </div>

                  <div className="flex space-x-1">
                    {appointment.status?.toLowerCase() === 'confirmed' && (
                      <button
                        onClick={() => handleQuickUpdateStatus(appointment.id, 'confirmed')}
                        className="px-2 sm:px-3 py-1 bg-green-500 text-white text-[10px] sm:text-xs rounded hover:bg-green-600 transition-colors duration-200 font-medium whitespace-nowrap"
                        title="Tandai sebagai Selesai"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-10 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Tidak Ada Janji Temu Aktif Hari Ini</h3>
            <p className="text-xs sm:text-base text-gray-500 mb-3 sm:mb-4">Anda tidak memiliki janji temu confirmed untuk hari ini.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <a
                href="/admin/appointment"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-brown-600 text-white text-sm rounded-lg hover:bg-brown-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Janji Temu
              </a>
              <button
                onClick={fetchAllData}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Periksa Lagi
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Anggota Terbaru</h2>
            <a href="/admin/member" className="text-xs sm:text-sm text-brown-600 hover:text-brown-700 font-medium">
              Lihat Semua →
            </a>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brown-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-brown-600">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">{member.name || 'T/A'}</h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <span className="truncate">{member.email || 'Tidak ada email'}</span>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                    {member.join_date ? new Date(member.join_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short'
                    }) : 'T/A'}
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full inline-block mt-1 ${
                    member.status?.toLowerCase() === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status || 'tidak aktif'}
                  </span>
                </div>
              </div>
            ))}
            {recentMembers.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-sm text-gray-500">
                Tidak ada anggota terbaru ditemukan
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Anggota Teratas berdasarkan Kunjungan</h2>
            <a href="/admin/member" className="text-xs sm:text-sm text-brown-600 hover:text-brown-700 font-medium">
              Lihat Semua →
            </a>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {topMembers.map((member, index) => (
              <div key={member.id} className="flex items-center p-2 sm:p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200">
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-brown-100 text-brown-600 text-xs sm:text-base font-bold rounded-full mr-2 sm:mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">{member.name || 'T/A'}</h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <span className="truncate">{member.email || 'Tidak ada email'}</span>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <div className="text-base sm:text-lg font-bold text-gray-800">{member.total_visits || 0}</div>
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">kunjungan</span>
                </div>
              </div>
            ))}
            {topMembers.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-sm text-gray-500">
                Tidak ada data perawatan tersedia
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Perawatan Selesai Terbaru</h2>
          <a href="/admin/appointment" className="text-xs sm:text-sm text-brown-600 hover:text-brown-700 font-medium">
            Lihat Semua →
          </a>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {recentTreatments.map((treatment) => (
            <div key={treatment.id} className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">{treatment.customer_name || 'T/A'}</h3>
                  <span className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">
                    Rp {(treatment.amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex flex-col text-xs sm:text-sm text-gray-500 space-y-0.5">
                  <span className="truncate">{treatment.treatment_category || 'T/A'}</span>
                  <span className="text-brown-600 font-medium truncate">{treatment.therapist_name || 'T/A'}</span>
                  <span className="truncate">
                    {treatment.date ? new Date(treatment.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'T/A'}
                    {treatment.time && `, ${formatAppointmentTime(treatment.time)}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {recentTreatments.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-sm text-gray-500">
              Belum ada perawatan yang selesai
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Terapis Teratas</h2>
          <a href="/admin/therapist" className="text-xs sm:text-sm text-brown-600 hover:text-brown-700 font-medium">
            Lihat Semua →
          </a>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {topTherapists.map((therapist) => (
            <div key={therapist.id} className="flex items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 gap-3">
              <div className="text-2xl sm:text-3xl flex-shrink-0">{therapist.image || '👩‍⚕️'}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{therapist.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-0.5 sm:space-y-0">
                  <span className="whitespace-nowrap">{therapist.completedAppointments || 0} perawatan selesai</span>
                  {therapist.totalAppointments > 0 && (
                    <>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="whitespace-nowrap">{therapist.totalAppointments} total janji temu</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base sm:text-lg font-bold text-brown-600 mb-1">
                  {therapist.completedAppointments || 0}
                </div>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full inline-block ${
                  therapist.status?.toLowerCase() === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {therapist.status || 'aktif'}
                </span>
              </div>
            </div>
          ))}
          {topTherapists.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-sm text-gray-500">
              Tidak ada data terapis tersedia
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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