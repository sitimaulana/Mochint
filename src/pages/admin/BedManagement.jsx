import React, { useState, useEffect, useMemo } from 'react';
import Preloader from '../../components/common/Preloader';

const BedManagement = () => {
  const APPOINTMENTS_API_URL = '/api/appointments';
  const TIMESLOTS_API_URL = '/api/timeslots';
  const Token = localStorage.getItem('token');

  const BEDS_CAPACITY = 3;
  const CLINIC_HOURS = {
    open: 8,
    close: 20
  };

  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [disabledTimeslots, setDisabledTimeslots] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDisabledTimeslots();
  }, [refreshKey, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(APPOINTMENTS_API_URL, {
        headers: {
          'Authorization': `Bearer ${Token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data');
      
      const data = await response.json();
      const appointmentsData = data.data || data || [];
      
      // Filter appointments untuk tanggal yang dipilih dan status confirmed
      const filteredAppointments = appointmentsData.filter(apt => {
        const aptDate = apt.date?.split('T')[0] || apt.date;
        return aptDate === selectedDate && apt.status === 'confirmed';
      });
      
      setAppointments(filteredAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisabledTimeslots = async () => {
    try {
      const response = await fetch(`${TIMESLOTS_API_URL}?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${Token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengambil disabled timeslots');
      
      const data = await response.json();
      setDisabledTimeslots(data.data || []);
    } catch (err) {
      console.error('Error fetching disabled timeslots:', err);
      setDisabledTimeslots([]);
    }
  };

  const toggleTimeslot = async (timeSlot) => {
    try {
      const response = await fetch(`${TIMESLOTS_API_URL}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          time_slot: timeSlot,
          reason: 'Disabled by admin'
        })
      });
      
      if (!response.ok) throw new Error('Gagal toggle timeslot');
      
      const data = await response.json();
      
      // Refresh disabled timeslots
      fetchDisabledTimeslots();
      
      // Show notification
      alert(data.message);
    } catch (err) {
      console.error('Error toggling timeslot:', err);
      alert('Gagal mengubah status timeslot');
    }
  };

  const isTimeslotDisabled = (timeSlot) => {
    return disabledTimeslots.some(dt => dt.time_slot === timeSlot);
  };

  // Generate all time slots
  const generateTimeSlots = () => {
    const slots = [];
    const interval = 30;
    
    for (let hour = CLINIC_HOURS.open; hour < CLINIC_HOURS.close; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Calculate end time
  const calculateEndTime = (startTime, duration = 90) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    return date.toTimeString().substring(0, 5);
  };

  // Calculate bed availability for each time slot
  const bedAvailability = useMemo(() => {
    const allSlots = generateTimeSlots();
    const availability = {};
    
    allSlots.forEach(slot => {
      availability[slot] = {
        available: BEDS_CAPACITY,
        occupied: 0,
        appointments: []
      };
    });
    
    appointments.forEach(apt => {
      const startTime = apt.time;
      const endTime = calculateEndTime(startTime, 90);
      
      allSlots.forEach(slot => {
        const slotTime = new Date(`2000-01-01T${slot}:00`);
        const aptStart = new Date(`2000-01-01T${startTime}:00`);
        const aptEnd = new Date(`2000-01-01T${endTime}:00`);
        
        if (slotTime >= aptStart && slotTime < aptEnd) {
          availability[slot].occupied += 1;
          availability[slot].available = Math.max(0, BEDS_CAPACITY - availability[slot].occupied);
          availability[slot].appointments.push({
            id: apt.id,
            customer: apt.customer_name,
            treatment: apt.treatment_name,
            time: `${startTime} - ${endTime}`
          });
        }
      });
    });
    
    return availability;
  }, [appointments, selectedDate]);

  // Statistics
  const stats = useMemo(() => {
    const slots = Object.values(bedAvailability);
    const fullyOccupied = slots.filter(s => s.available === 0).length;
    const partiallyOccupied = slots.filter(s => s.occupied > 0 && s.available > 0).length;
    const totalAvailable = slots.filter(s => s.available === BEDS_CAPACITY).length;
    const totalOccupied = appointments.length;
    
    return {
      fullyOccupied,
      partiallyOccupied,
      totalAvailable,
      totalOccupied,
      utilizationRate: totalOccupied > 0 ? ((totalOccupied / (slots.length * BEDS_CAPACITY)) * 100).toFixed(1) : 0
    };
  }, [bedAvailability, appointments]);

  const getStatusColor = (available) => {
    if (available === 0) return 'bg-red-500';
    if (available === 1) return 'bg-amber-500';
    if (available === 2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = (available) => {
    if (available === 0) return 'PENUH';
    if (available === 1) return '1 BED';
    if (available === 2) return '2 BED';
    return '3 BED';
  };

  const getStatusBg = (available) => {
    if (available === 0) return 'bg-red-50 border-red-200';
    if (available === 1) return 'bg-amber-50 border-amber-200';
    if (available === 2) return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DD for storage
  const formatDateForStorage = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  if (loading) {
    return <Preloader type="partial" text="Memuat data bed..." />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bed className="text-brown-600" size={28} />
            Manajemen Bed
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor ketersediaan bed real-time berdasarkan janji temu</p>
        </div>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="bg-brown-600 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg font-bold hover:bg-brown-700 transition-colors duration-200 w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Segarkan Data
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Calendar size={18} className="text-brown-600" />
            Pilih Tanggal:
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={selectedDate ? formatDateForDisplay(selectedDate) : ''}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and forward slashes
                const filtered = value.replace(/[^0-9/]/g, '');
                
                // Auto-add slashes
                let formatted = filtered;
                if (filtered.length === 2 && !filtered.includes('/')) {
                  formatted = filtered + '/';
                } else if (filtered.length === 5 && filtered.split('/').length === 2) {
                  formatted = filtered + '/';
                }
                
                // Update display value
                e.target.value = formatted;
                
                // If complete date format (DD/MM/YYYY), convert and save
                if (formatted.length === 10) {
                  const storageDate = formatDateForStorage(formatted);
                  setSelectedDate(storageDate);
                }
              }}
              placeholder="DD/MM/YYYY"
              maxLength="10"
              className="border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 w-40"
            />
            {/* Hidden date input for calendar picker */}
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute right-0 top-0 w-10 h-full opacity-0 cursor-pointer"
              style={{ zIndex: 2 }}
            />
            {/* Calendar icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {formatDate(selectedDate)}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalAvailable}</div>
              <div className="text-xs text-gray-600">Slot Tersedia Penuh</div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.partiallyOccupied}</div>
              <div className="text-xs text-gray-600">Slot Terisi Sebagian</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.fullyOccupied}</div>
              <div className="text-xs text-gray-600">Slot Penuh</div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-brown-600">{stats.totalOccupied}</div>
              <div className="text-xs text-gray-600">Total Appointment</div>
            </div>
            <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
              <Calendar className="text-brown-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold text-gray-700">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">3 Bed Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">2 Bed Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">1 Bed Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Penuh (0 Bed)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-xs text-gray-600">Dinonaktifkan</span>
          </div>
        </div>
      </div>

      {/* Bed Availability Grid */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brown-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Ketersediaan Bed Per Waktu
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {generateTimeSlots().map((time) => {
            const slot = bedAvailability[time];
            const available = slot.available;
            const isDisabled = isTimeslotDisabled(time);
            
            return (
              <div 
                key={time}
                className={`relative p-4 rounded-xl border-2 transition-all ${isDisabled ? 'bg-gray-100 border-gray-300 opacity-60' : getStatusBg(available)} group hover:shadow-md`}
              >
                {/* Status Indicator Dot */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${isDisabled ? 'bg-gray-400' : getStatusColor(available)}`}></div>
                
                {/* Toggle Disable Button */}
                <button
                  onClick={() => toggleTimeslot(time)}
                  className={`absolute top-2 left-2 p-1 rounded-md text-xs font-bold transition-all ${
                    isDisabled 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={isDisabled ? 'Aktifkan slot ini' : 'Nonaktifkan slot ini'}
                >
                  {isDisabled ? <i className="fas fa-check" style={{ fontSize: '12px' }}></i> : <i className="fas fa-x" style={{ fontSize: '12px' }}></i>}
                </button>
                
                <div className="text-center mt-2">
                  <div className="text-lg font-bold text-gray-800">{time}</div>
                  {isDisabled ? (
                    <div className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-500">
                      DISABLED
                    </div>
                  ) : (
                    <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
                      available === 0 ? 'text-red-600' :
                      available === 1 ? 'text-amber-600' :
                      available === 2 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStatusText(available)}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(BEDS_CAPACITY)].map((_, i) => (
                      <Bed 
                        key={i}
                        size={12}
                        className={isDisabled ? 'text-gray-300' : (i < slot.occupied ? 'text-red-500' : 'text-green-400')}
                      />
                    ))}
                  </div>
                </div>

                {/* Tooltip on hover */}
                {!isDisabled && slot.appointments.length > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[200px]">
                      <div className="font-bold mb-2">Appointment Aktif:</div>
                      {slot.appointments.map((apt, idx) => (
                        <div key={idx} className="mb-1 last:mb-0 border-b border-gray-700 last:border-0 pb-1 last:pb-0">
                          <div className="font-medium">{apt.customer}</div>
                          <div className="text-[10px] text-gray-400">{apt.treatment}</div>
                          <div className="text-[10px] text-gray-400">{apt.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disabled Tooltip */}
                {isDisabled && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[150px] text-center">
                      <div className="font-bold">Slot Dinonaktifkan</div>
                      <div className="text-[10px] text-gray-400 mt-1">User tidak dapat memilih slot ini</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Appointments Detail */}
      {appointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-brown-600" />
            Detail Appointment Hari Ini ({appointments.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  <th className="p-3">ID</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Perawatan</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Durasi</th>
                  <th className="p-3">Bed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((apt) => {
                  const endTime = calculateEndTime(apt.time);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-600">
                        {apt.appointment_id || `APT-${apt.id}`}
                      </td>
                      <td className="p-3 font-medium">{apt.customer_name}</td>
                      <td className="p-3 text-gray-600">{apt.treatment_name}</td>
                      <td className="p-3 font-bold text-brown-600">
                        {apt.time} - {endTime}
                      </td>
                      <td className="p-3 text-gray-500">90 menit</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Bed size={16} className="text-green-600" />
                          <span className="text-xs font-bold">1 Bed</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <Bed size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">Tidak Ada Appointment</h3>
          <p className="text-sm text-gray-500">Semua bed tersedia untuk tanggal {formatDate(selectedDate)}</p>
        </div>
      )}
    </div>
  );
};

export default BedManagement;

