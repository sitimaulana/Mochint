import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TherapistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const API_URL = '/api/therapists';
  const APPOINTMENTS_API_URL = '/api/appointments';
  const Token = localStorage.getItem('token');

  useEffect(() => {
    fetchTherapistData();
  }, [id]);

  const fetchTherapistData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [therapistResponse, appointmentsResponse] = await Promise.all([
        axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${Token}` }
        }),
        axios.get(APPOINTMENTS_API_URL, {
          headers: { Authorization: `Bearer ${Token}` }
        })
      ]);

      const therapistData = therapistResponse.data?.data || therapistResponse.data;
      const appointmentsData = appointmentsResponse.data?.data || appointmentsResponse.data || [];

      console.log('=== THERAPIST DETAIL DEBUG ===');
      console.log('Therapist ID from URL:', id);
      console.log('Therapist Data:', therapistData);
      console.log('All Appointments:', appointmentsData);

      setTherapist(therapistData);
      
      // Filter appointments untuk therapist ini - HANYA yang COMPLETED
      // Coba compare dengan berbagai kemungkinan field
      const therapistAppointments = Array.isArray(appointmentsData) 
        ? appointmentsData.filter(app => {
            const matches = (
              app.therapist_id === parseInt(id) || 
              app.therapist_id === id ||
              app.therapist_name === therapistData.name
            ) && app.status === 'completed';
            
            if (matches) {
              console.log('Matched appointment:', app);
            }
            
            return matches;
          })
        : [];
      
      console.log('Filtered Therapist Appointments:', therapistAppointments);
      
      setAppointments(therapistAppointments);
    } catch (error) {
      console.error('Error fetching therapist data:', error);
      setError('Gagal memuat data therapist. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk grouping appointments by month
  const groupAppointmentsByMonth = () => {
    if (!Array.isArray(appointments)) return {};

    const grouped = {};
    
    appointments.forEach(appointment => {
      if (!appointment.date) return;
      
      try {
        const date = new Date(appointment.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!grouped[monthYear]) {
          grouped[monthYear] = {
            appointments: [],
            totalRevenue: 0,
            completed: 0
          };
        }
        
        grouped[monthYear].appointments.push(appointment);
        grouped[monthYear].completed++;
        grouped[monthYear].totalRevenue += parseFloat(appointment.amount) || 0;
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    });

    return grouped;
  };

  const monthlyData = groupAppointmentsByMonth();
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));

  // Get unique years from appointments
  const availableYears = [...new Set(sortedMonths.map(monthYear => monthYear.split('-')[0]))];

  // Get unique months (1-12)
  const availableMonths = [...new Set(sortedMonths.map(monthYear => monthYear.split('-')[1]))].sort();

  // Filter months by selected year and month
  const filteredMonths = sortedMonths.filter(monthYear => {
    const [year, month] = monthYear.split('-');
    const matchesYear = selectedYear === 'all' || year === selectedYear.toString();
    const matchesMonth = selectedMonth === 'all' || month === selectedMonth;
    return matchesYear && matchesMonth;
  });

  // Format month name
  const formatMonthYear = (monthYear) => {
    const [year, month] = monthYear.split('-');
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Format month name only
  const formatMonthName = (monthNumber) => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return monthNames[parseInt(monthNumber) - 1];
  };

  // Format currency
  const formatRupiah = (val) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Calculate overall statistics - Total semua appointment yang sudah ditangani
  const overallStats = {
    totalAppointments: appointments.length, // Total semua yang pernah ditangani
    monthlyAppointments: filteredMonths.reduce((sum, monthYear) => sum + monthlyData[monthYear].appointments.length, 0), // Per bulan sesuai filter
    monthlyRevenue: filteredMonths.reduce((sum, monthYear) => sum + monthlyData[monthYear].totalRevenue, 0) // Revenue per bulan sesuai filter
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data therapist...</p>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/admin/therapist')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
          <button
            onClick={fetchTherapistData}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/therapist')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Kembali ke Daftar Therapist</span>
          <span className="sm:hidden">Kembali</span>
        </button>
      </div>

      {/* Therapist Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brown-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-medium text-brown-600">
                {(therapist.name || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{therapist.name}</h1>
              <p className="text-xs sm:text-sm text-gray-600">ID: {therapist.therapist_id || therapist.id}</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-1 sm:space-y-0">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{therapist.email}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {therapist.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block ${
              therapist.status === 'active'
                ? 'bg-green-100 text-green-800'
                : therapist.status === 'inactive'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {therapist.status === 'active' ? 'Aktif' : 
               therapist.status === 'inactive' ? 'Tidak Aktif' : 
               therapist.status === 'on_leave' ? 'Cuti' : 'Tidak Aktif'}
            </span>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Bergabung: {therapist.join_date || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="text-xl sm:text-2xl font-bold text-gray-800">{overallStats.totalAppointments}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Appointment Ditangani</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{overallStats.monthlyAppointments}</div>
          <div className="text-xs sm:text-sm text-gray-600">Perawatan Per Bulan</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
          <div className="text-lg sm:text-xl font-bold text-purple-600">{formatRupiah(overallStats.monthlyRevenue)}</div>
          <div className="text-xs sm:text-sm text-gray-600">Pendapatan Per Bulan</div>
        </div>
      </div>

      {/* Filter by Year and Month */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Riwayat Appointment Selesai Per Bulan</h2>
            <p className="text-xs text-gray-500 mt-1">Menampilkan hanya appointment dengan status completed</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              <option value="all">Semua Bulan</option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            {(selectedYear !== 'all' || selectedMonth !== 'all') && (
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedMonth('all');
                }}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Data */}
      {filteredMonths.length > 0 ? (
        <div className="space-y-4">
          {filteredMonths.map(monthYear => {
            const data = monthlyData[monthYear];
            return (
              <div key={monthYear} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Month Header */}
                <div className="bg-brown-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      {formatMonthYear(monthYear)}
                    </h3>
                    <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-800 text-sm sm:text-base">{data.appointments.length}</div>
                        <div className="text-gray-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-green-600 text-sm sm:text-base">{data.completed}</div>
                        <div className="text-gray-600">Selesai</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-purple-600 text-xs sm:text-sm">{formatRupiah(data.totalRevenue)}</div>
                        <div className="text-gray-600">Pendapatan</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointments List */}
                <div className="p-3 sm:p-6">
                  {/* Desktop View - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">ID</th>
                          <th className="pb-3 font-medium">Tanggal</th>
                          <th className="pb-3 font-medium">Waktu</th>
                          <th className="pb-3 font-medium">Pasien</th>
                          <th className="pb-3 font-medium">Treatment</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.appointments.map((appointment, index) => (
                          <tr key={appointment.id || index} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3">
                              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {appointment.appointment_id || appointment.id}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {appointment.date || 'N/A'}
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {appointment.time || 'N/A'}
                            </td>
                            <td className="py-3">
                              <div className="font-medium text-gray-800">
                                {appointment.customer_name || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {appointment.treatment_name || appointment.treatment || 'N/A'}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status === 'completed' ? 'Selesai' :
                                 appointment.status === 'cancelled' ? 'Dibatalkan' :
                                 appointment.status === 'confirmed' ? 'Dikonfirmasi' :
                                 appointment.status === 'pending' ? 'Pending' : 
                                 appointment.status || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 text-sm font-semibold text-gray-800">
                              {formatRupiah(appointment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="md:hidden space-y-3">
                    {data.appointments.map((appointment, index) => (
                      <div key={appointment.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded text-gray-700">
                            {appointment.appointment_id || appointment.id}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status === 'completed' ? 'Selesai' :
                             appointment.status === 'cancelled' ? 'Dibatalkan' :
                             appointment.status === 'confirmed' ? 'Dikonfirmasi' :
                             appointment.status === 'pending' ? 'Pending' : 
                             appointment.status || 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Pasien:</span>
                            <span className="text-xs font-medium text-gray-800">{appointment.customer_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Treatment:</span>
                            <span className="text-xs text-gray-600">{appointment.treatment_name || appointment.treatment || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Tanggal:</span>
                            <span className="text-xs text-gray-600">{appointment.date || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Waktu:</span>
                            <span className="text-xs text-gray-600">{appointment.time || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-300">
                            <span className="text-xs text-gray-500">Jumlah:</span>
                            <span className="text-sm font-bold text-green-700">{formatRupiah(appointment.amount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Appointment Selesai</h3>
          <p className="text-gray-500">
            Therapist ini belum menyelesaikan appointment
            {selectedMonth !== 'all' && selectedYear !== 'all' && ` untuk ${formatMonthName(selectedMonth)} ${selectedYear}`}
            {selectedMonth !== 'all' && selectedYear === 'all' && ` untuk bulan ${formatMonthName(selectedMonth)}`}
            {selectedMonth === 'all' && selectedYear !== 'all' && ` pada tahun ${selectedYear}`}
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default TherapistDetail;

