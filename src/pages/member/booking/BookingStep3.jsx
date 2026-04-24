import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../../services/api';

const BookingStep3 = () => {
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [displayDate, setDisplayDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [treatment, setTreatment] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [disabledTimeslots, setDisabledTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState(null);

  useEffect(() => {
    const savedTreatment = sessionStorage.getItem('selectedTreatment');
    if (savedTreatment) {
      setTreatment(JSON.parse(savedTreatment));
    } else {
      navigate('/member/booking/step-2');
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
      fetchDisabledTimeslots(selectedDate);
    }
  }, [selectedDate]);

  const CLINIC_HOURS = {
    open: 8,
    close: 20
  };
  
  const BEDS_CAPACITY = 3;
  const TREATMENT_DURATION = 90;

  const fetchBookingsForDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await appointmentAPI.getAll();
      
      if (response.data && response.data.success) {
        const allAppointments = response.data.data;
        
        // Get current user ID
        const activeUser = JSON.parse(localStorage.getItem('active_user'));
        const currentUserId = activeUser?.id;
        
        console.log('[FETCH] Fetching appointments for date:', date);
        console.log('[USER] Current user ID:', currentUserId);
        console.log('[INFO] Total appointments from API:', allAppointments.length);
        
        // Filter appointments for selected date and confirmed status
        const filteredAppointments = allAppointments.filter(appointment => {
          const appointmentDate = appointment.date?.split('T')[0] || appointment.date;
          const dateMatch = appointmentDate === date;
          const statusMatch = appointment.status === 'confirmed';
          
          return dateMatch && statusMatch;
        });
        
        console.log('[SUCCESS] Filtered appointments (confirmed only):', filteredAppointments.length);
        console.log('[LIST] Appointments:', filteredAppointments.map(a => ({
          time: a.time, 
          treatment: a.treatment_name,
          member_id: a.member_id,
          status: a.status 
        })));
        
        const convertedBookings = filteredAppointments.map(appointment => {
          const duration = 90;
          
          return {
            date: date,
            startTime: appointment.time,
            duration: duration,
            bedsUsed: 1,
            member_id: appointment.member_id // Tambahkan member_id untuk cek user
          };
        });
        
        console.log('[BED] Converted bookings:', convertedBookings);
        
        setBookings(convertedBookings);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (err) {
      console.error('âŒ Error fetching appointments:', err);
      setError('Gagal memuat data jadwal. Menggunakan data offline.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisabledTimeslots = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timeslots?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisabledTimeslots(data.data || []);
        console.log('[BLOCKED] Disabled timeslots:', data.data);
      } else {
        setDisabledTimeslots([]);
      }
    } catch (err) {
      console.error('Error fetching disabled timeslots:', err);
      setDisabledTimeslots([]);
    }
  };

  const isTimeslotDisabledByAdmin = (timeSlot) => {
    return disabledTimeslots.some(dt => dt.time_slot === timeSlot);
  };

  const generateAllTimeSlots = () => {
    const slots = [];
    const interval = 30;
    
    for (let hour = CLINIC_HOURS.open; hour < CLINIC_HOURS.close; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === CLINIC_HOURS.close && minute > 0) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const calculateEndTime = (startTime, duration = TREATMENT_DURATION) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    return date.toTimeString().substring(0, 5);
  };

  const calculateBedAvailability = useMemo(() => {
    if (!selectedDate) return {};
    
    const allSlots = generateAllTimeSlots();
    const availability = {};
    
    allSlots.forEach(slot => {
      availability[slot] = BEDS_CAPACITY;
    });
    
    console.log('[BED] Calculating bed availability...');
    console.log('[LIST] Bookings to process:', bookings.length);
    
    bookings.forEach((booking, index) => {
      if (booking.date === selectedDate) {
        const startTime = booking.startTime;
        const endTime = calculateEndTime(startTime, booking.duration);
        
        console.log(`Booking ${index + 1}: ${startTime} - ${endTime} (${booking.duration} menit)`);
        
        allSlots.forEach(slot => {
          const slotTime = new Date(`2000-01-01T${slot}:00`);
          const bookingStart = new Date(`2000-01-01T${startTime}:00`);
          const bookingEnd = new Date(`2000-01-01T${endTime}:00`);
          
          if (slotTime >= bookingStart && slotTime < bookingEnd) {
            const before = availability[slot];
            availability[slot] = Math.max(0, availability[slot] - booking.bedsUsed);
            if (before !== availability[slot]) {
              console.log(`  ${slot}: ${before} → ${availability[slot]} bed`);
            }
          }
        });
      }
    });
    
    const fullSlots = Object.values(availability).filter(v => v === 0).length;
    const availableSlots = Object.values(availability).filter(v => v > 0).length;
    console.log(`[INFO] Summary: ${availableSlots} slots available, ${fullSlots} slots full`);
    
    return availability;
  }, [selectedDate, bookings]);

  // Cek apakah user sudah punya booking di tanggal yang sama
  const hasUserBookingAtTime = (startTime) => {
    const activeUser = JSON.parse(localStorage.getItem('active_user'));
    const currentUserId = activeUser?.id;
    
    if (!currentUserId || !selectedDate) return false;
    
    const endTime = calculateEndTime(startTime);
    
    // Cek apakah ada booking user di slot yang overlap
    return bookings.some(booking => {
      // Skip jika bukan booking user ini
      if (booking.member_id !== currentUserId) return false;
      
      const bookingStart = new Date(`2000-01-01T${booking.startTime}:00`);
      const bookingEnd = new Date(`2000-01-01T${calculateEndTime(booking.startTime)}:00`);
      const newStart = new Date(`2000-01-01T${startTime}:00`);
      const newEnd = new Date(`2000-01-01T${endTime}:00`);
      
      // Cek overlap: booking baru overlap dengan booking yang sudah ada
      const hasOverlap = (newStart < bookingEnd && newEnd > bookingStart);
      
      if (hasOverlap) {
        console.log(`[WARNING] User already has booking: ${booking.startTime} - ${calculateEndTime(booking.startTime)}`);
      }
      
      return hasOverlap;
    });
  };

  const isTimeSlotValid = (startTime) => {
    if (!startTime || !selectedDate) return false;
    
    // Cek apakah user sudah punya booking yang overlap
    if (hasUserBookingAtTime(startTime)) {
      return false;
    }
    
    const endTime = calculateEndTime(startTime);
    const slotEndTime = new Date(`2000-01-01T${endTime}:00`);
    const clinicCloseTime = new Date(`2000-01-01T${CLINIC_HOURS.close.toString().padStart(2, '0')}:00:00`);
    
    if (slotEndTime > clinicCloseTime) {
      return false;
    }
    
    const allSlots = generateAllTimeSlots();
    const treatmentSlots = [];
    
    let currentTime = new Date(`2000-01-01T${startTime}:00`);
    const endTimeObj = new Date(`2000-01-01T${endTime}:00`);
    
    while (currentTime < endTimeObj) {
      const slot = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      if (allSlots.includes(slot)) {
        treatmentSlots.push(slot);
      }
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return treatmentSlots.every(slot => 
      calculateBedAvailability[slot] !== undefined && calculateBedAvailability[slot] > 0
    );
  };

  const getAvailableBedsForSlot = (time) => {
    return calculateBedAvailability[time] || 0;
  };

  const getAllTimeSlotsWithAvailability = () => {
    if (!selectedDate) return [];
    
    return generateAllTimeSlots()
      .map(slot => {
        const endTime = calculateEndTime(slot);
        const slotEndTime = new Date(`2000-01-01T${endTime}:00`);
        const clinicCloseTime = new Date(`2000-01-01T${CLINIC_HOURS.close.toString().padStart(2, '0')}:00:00`);
        
        const exceedsClosingTime = slotEndTime > clinicCloseTime;
        const availableBeds = getAvailableBedsForSlot(slot);
        const hasAvailableBeds = availableBeds > 0;
        const userHasBooking = hasUserBookingAtTime(slot);
        const isDisabledByAdmin = isTimeslotDisabledByAdmin(slot);
        
        return {
          time: slot,
          availableBeds: availableBeds,
          isAvailable: hasAvailableBeds && !exceedsClosingTime && !userHasBooking && !isDisabledByAdmin,
          exceedsClosingTime: exceedsClosingTime,
          userHasBooking: userHasBooking,
          isDisabledByAdmin: isDisabledByAdmin
        };
      })
      .filter(slot => !slot.exceedsClosingTime); // Filter out slots yang melewati jam tutup
  };

  const formatDateForStorage = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return '';
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  };

  const isValidDateFormat = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return false;
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return false;
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 2000 || yearNum > 2100) return false;
    
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getFullYear() === yearNum && 
           date.getMonth() === monthNum - 1 && 
           date.getDate() === dayNum;
  };

  const handleDateChange = (value) => {
    let cleaned = value.replace(/[^0-9/]/g, '');
    
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
      cleaned = cleaned + '/';
    }
    
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    
    setDisplayDate(cleaned);
    
    if (cleaned.length === 10 && isValidDateFormat(cleaned)) {
      const storageDate = formatDateForStorage(cleaned);
      
      const selectedDateObj = new Date(storageDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDateObj >= today) {
        setSelectedDate(storageDate);
        setSelectedTime('');
        setDateError(null);
      } else {
        setSelectedDate('');
        setDateError('Tidak dapat memilih tanggal yang sudah berlalu');
      }
    } else if (cleaned.length === 10) {
      setSelectedDate('');
      setDateError('Format tanggal tidak valid');
    } else {
      setSelectedDate('');
      if (dateError) {
        setDateError(null);
      }
    }
  };

  const handleDatePickerChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setSelectedDate(dateValue);
      setDisplayDate(formatDateForDisplay(dateValue));
      setSelectedTime('');
      setDateError(null);
    }
  };

  const handleNextStep = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan jam terlebih dahulu!");
      return;
    }
    
    if (!isTimeSlotValid(selectedTime)) {
      if (hasUserBookingAtTime(selectedTime)) {
        alert("Anda sudah memiliki booking di waktu yang bersamaan. Silakan pilih waktu lain.");
      } else {
        alert("Slot waktu tidak tersedia. Silakan pilih waktu lain.");
      }
      return;
    }
    
    try {
      setLoading(true);
      
      const activeUser = JSON.parse(localStorage.getItem('active_user'));
      
      if (!activeUser || !activeUser.id) {
        alert("User tidak ditemukan. Silakan login kembali.");
        navigate('/auth/login');
        return;
      }
      
      const priceString = treatment.price?.toString().replace(/\./g, '') || '0';
      const priceNumber = parseInt(priceString);
      
      const appointmentData = {
        member_id: activeUser.id,
        customer_name: activeUser.name,
        treatment_id: treatment.id,
        therapist_id: null,
        date: selectedDate,
        time: selectedTime,
        amount: priceNumber,
        status: 'confirmed'
      };
      
      console.log('[NOTIFY] Creating appointment:', appointmentData);
      
      const response = await appointmentAPI.create(appointmentData);
      
      if (response.data && response.data.success) {
        const createdAppointment = response.data.data;
        
        console.log('[SUCCESS] Appointment created:', createdAppointment);
        
        const finalData = {
          ...treatment,
          appointmentId: createdAppointment.id,
          appointment_id: createdAppointment.appointment_id,
          date: selectedDate,
          startTime: selectedTime,
          endTime: calculateEndTime(selectedTime),
          duration: `${TREATMENT_DURATION} menit`,
          bedsNeeded: 1,
          status: createdAppointment.status
        };
        
        sessionStorage.setItem('finalBooking', JSON.stringify(finalData));
        navigate('/member/booking/success');
      } else {
        throw new Error('Failed to create appointment');
      }
      
    } catch (err) {
      console.error('âŒ Error creating appointment:', err);
      alert('Gagal membuat appointment. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "-";
    const date = new Date(selectedDate);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 sm:p-6 md:p-8 font-sans text-[#3E2723]">
      
      <nav className="hidden md:flex items-center gap-3 text-xs mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')} 
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all border border-gray-100"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display uppercase tracking-widest">
          Jadwal
        </span>
      </nav>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="bg-white p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 text-left">
            
            <div className="mb-6 sm:mb-8 md:mb-10 text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-[#5D4037] mb-2 sm:mb-3 tracking-tighter">Tentukan Jadwal</h1>
              <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed font-sans font-medium">
                Pilih tanggal dan waktu kunjungan Anda. Sistem akan menyesuaikan dengan ketersediaan bed dan jam operasional klinik!
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8 md:space-y-10 mt-6 sm:mt-8">
              <div>
                <label className="text-[9px] sm:text-[10px] font-black text-[#5D4037] mb-3 sm:mb-4 uppercase flex items-center gap-2 tracking-wider sm:tracking-widest font-sans ml-1">
                  <i className="fas fa-calendar" style={{ color: '#8D6E63', fontSize: '14px' }}></i> 1. Pilih Tanggal Perawatan
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="w-full lg:w-2/3 relative group">
                      <input 
                        type="text" 
                        value={displayDate}
                        placeholder="Pilih tanggal (DD/MM/YYYY)"
                        maxLength={10}
                        className={`w-full pl-4 pr-14 py-4 bg-[#FDFBF7] border-2 rounded-[20px] outline-none font-bold text-[#3E2723] font-sans cursor-text transition-all placeholder:text-gray-400 placeholder:font-normal ${
                          displayDate.length === 10 && !selectedDate 
                            ? 'border-red-300 focus:border-red-500' 
                            : selectedDate 
                              ? 'border-green-300 focus:border-green-500'
                              : 'border-transparent focus:border-[#8D6E63]'
                        } text-sm md:text-base`}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="relative">
                          <input 
                            type="date" 
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]}
                            className="absolute inset-0 opacity-0 cursor-pointer w-11 h-11 z-10"
                            onChange={handleDatePickerChange}
                            title="Buka kalender"
                          />
                          <div className="w-11 h-11 flex items-center justify-center bg-[#8D6E63] text-white rounded-xl hover:bg-[#5D4037] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm">
                            <i className="fas fa-calendar" style={{ fontSize: '20px' }}></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden md:block absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                          Klik untuk buka kalender
                        </div>
                      </div>
                    </div>
                    
                    {selectedDate && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-[20px] text-sm text-green-700 font-medium w-full lg:w-auto animate-fadeIn">
                        <i className="fas fa-calendar" style={{ fontSize: '16px' }}></i>
                        <span className="text-xs md:text-sm">{formatSelectedDate()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 ml-2 space-y-1">
                    {!displayDate && (
                      <>
                        <p className="flex items-center gap-2">
                          <i className="fas fa-lightbulb" style={{ color: '#EAB308', fontSize: '14px' }}></i>
                          <span><span className="font-bold">Ketik manual</span> (DD/MM/YYYY) atau <span className="font-bold text-[#8D6E63]">klik icon kalender</span> di kanan untuk buka kalender</span>
                        </p>
                      </>
                    )}
                    {displayDate && displayDate.length < 10 && (
                      <p className="text-blue-600 flex items-center gap-2">
                        <span>⌨️</span> Terus ketik untuk melengkapi tanggal...
                      </p>
                    )}
                    {displayDate.length === 10 && !selectedDate && dateError && (
                      <p className="text-red-600 flex items-center gap-2">
                        <i className="fas fa-circle-exclamation" style={{ fontSize: '14px' }}></i> {dateError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#5D4037] mb-4 uppercase flex items-center gap-2 tracking-widest font-sans ml-1">
                  <i className="fas fa-clock" style={{ color: '#8D6E63', fontSize: '14px' }}></i> 2. Pilih Jam Mulai
                </label>
                
                {!selectedDate ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Silakan pilih tanggal terlebih dahulu</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <i className="fas fa-spinner fa-spin" style={{ color: '#8D6E63', fontSize: '48px' }} className="mx-auto mb-4"></i>
                    <p className="text-gray-500 font-medium">Memuat jadwal tersedia...</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-700 font-medium">{error}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {getAllTimeSlotsWithAvailability().map((slot) => {
                        const { time, availableBeds, isAvailable, userHasBooking, isDisabledByAdmin } = slot;
                        const isSelected = selectedTime === time;
                        
                        let statusText = 'TERSEDIA';
                        if (isDisabledByAdmin) {
                          statusText = 'DITUTUP';
                        } else if (userHasBooking) {
                          statusText = 'SUDAH BOOKING';
                        } else if (!isAvailable) {
                          statusText = 'PENUH';
                        }
                        
                        return (
                          <button
                            key={time}
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedTime(time)}
                            className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 font-sans group ${
                              isSelected 
                                ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-lg scale-105 z-10' 
                                : !isAvailable 
                                  ? isDisabledByAdmin
                                    ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                                    : userHasBooking
                                      ? 'bg-orange-50 border-orange-200 opacity-70 cursor-not-allowed'
                                      : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                                  : 'bg-white border-gray-100 text-[#3E2723] hover:border-[#8D6E63]/50 hover:shadow-md'
                            }`}
                          >
                            <span className={`text-sm font-bold font-display`}>
                              {time}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                              isSelected ? 'text-white/70' : 
                              isDisabledByAdmin ? 'text-gray-500' :
                              userHasBooking ? 'text-orange-600' :
                              !isAvailable ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {statusText}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-[#FDFBF7] rounded-2xl border border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs font-medium text-gray-600">Penuh</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-xs font-medium text-gray-600">Sudah Booking</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span className="text-xs font-medium text-gray-600">Ditutup</span>
                          </div>
                        </div>
                        
                        <div className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
                          <i className="fas fa-clock" style={{ color: '#8D6E63', fontSize: '14px' }}></i>
                          Jam Operasional: 08:00 - 20:00
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-200 text-[#3E2723] p-8 rounded-[40px] shadow-lg sticky top-8 text-left">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3 text-[#8D6E63] tracking-tight">
              <i className="fas fa-circle-info" style={{ fontSize: '22px' }}></i> Ringkasan Booking
            </h3>
            
            <div className="space-y-6 font-sans">
              <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] text-[#3E2723] uppercase font-black mb-1.5 tracking-widest">Treatment</p>
                <p className="text-sm font-bold leading-snug mb-2">{treatment?.name || "-"}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 bg-white px-3 py-2 rounded-lg">
                  <Clock size={12} className="text-[#8D6E63]" />
                  <p>Durasi standar: <span className="font-bold text-[#8D6E63]">90 menit</span></p>
                </div>
                <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">
                  * Semua treatment di klinik kami berdurasi 1 jam 30 menit
                </p>
              </div>
              
              {selectedDate && (
                <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-[#3E2723] uppercase font-black mb-1.5 tracking-widest">Tanggal Kunjungan</p>
                  <p className="text-sm font-bold leading-snug mb-2">{formatSelectedDate()}</p>
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Total Slots:</span>
                      <span className="font-bold text-[#3E2723]">{getAllTimeSlotsWithAvailability().length} slot</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Tersedia:</span>
                      <span className="font-bold text-green-600">
                        {getAllTimeSlotsWithAvailability().filter(s => s.isAvailable).length} slot
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] text-[#3E2723] uppercase font-black mb-1.5 tracking-widest">Waktu Perawatan</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest mb-1">Mulai</p>
                    <p className="text-lg font-bold font-display text-[#3E2723]">
                      {selectedTime || "--:--"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest mb-1">Selesai</p>
                    <p className="text-lg font-bold font-display text-green-600">
                      {calculateEndTime(selectedTime) || "--:--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleNextStep}
              disabled={!selectedDate || !selectedTime || loading}
              className={`w-full mt-10 py-5 rounded-[20px] font-display font-bold uppercase text-[11px] tracking-[0.3em] transition-all shadow-lg flex items-center justify-center gap-3 ${
                selectedDate && selectedTime && !loading
                ? 'bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white hover:from-white hover:to-white hover:text-[#3E2723] hover:border-2 hover:border-[#8D6E63] active:scale-95' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '18px' }}></i>
                  <span>Membuat Appointment...</span>
                </>
              ) : selectedDate && selectedTime ? (
                'Konfirmasi Booking'
              ) : (
                'Pilih Tanggal & Waktu'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStep3;
