import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, Clock, Info, Bed, Loader2 } from 'lucide-react';
import { appointmentAPI } from '../../../services/api';
import axios from 'axios';

const BookingStep3 = () => {
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(''); // Format YYYY-MM-DD untuk backend
  const [displayDate, setDisplayDate] = useState(''); // Format DD/MM/YYYY untuk display
  const [selectedTime, setSelectedTime] = useState('');
  const [treatment, setTreatment] = useState(null);
  const [bookings, setBookings] = useState([]); // Data booking dari API/backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Error untuk fetching data
  const [dateError, setDateError] = useState(null); // Error untuk validasi tanggal

  useEffect(() => {
    const savedTreatment = sessionStorage.getItem('selectedTreatment');
    if (savedTreatment) {
      setTreatment(JSON.parse(savedTreatment));
    } else {
      navigate('/member/booking/step-2');
    }
  }, [navigate]);

  // Fetch appointments when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate]);

  const CLINIC_HOURS = {
    open: 8,    // 08:00
    close: 20   // 20:00
  };
  
  const BEDS_CAPACITY = 3;
  
  // PENTING: Semua treatment menggunakan durasi DEFAULT 90 menit (1 jam 30 menit)
  // Ini standar sistem booking klinik dan konsisten dengan BedManagement
  const TREATMENT_DURATION = 90; // Fixed 90 menit untuk semua treatment

  // Fetch appointments from backend
  const fetchBookingsForDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all appointments
      const response = await appointmentAPI.getAll();
      
      if (response.data && response.data.success) {
        const allAppointments = response.data.data;
        
        console.log('📅 Fetching appointments for date:', date);
        console.log('📊 Total appointments from API:', allAppointments.length);
        
        // Filter appointments for selected date and ONLY confirmed status
        // Appointment yang sudah completed tidak mengurangi ketersediaan bed masa depan
        const filteredAppointments = allAppointments.filter(appointment => {
          // Parse date dari backend - bisa dalam format YYYY-MM-DD atau timestamp
          const appointmentDate = appointment.date?.split('T')[0] || appointment.date;
          const dateMatch = appointmentDate === date;
          const statusMatch = appointment.status === 'confirmed';
          
          return dateMatch && statusMatch;
        });
        
        console.log('✅ Filtered appointments (confirmed only):', filteredAppointments.length);
        console.log('📋 Appointments:', filteredAppointments.map(a => ({ 
          time: a.time, 
          treatment: a.treatment_name,
          status: a.status 
        })));
        
        // Convert to format needed for bed calculation
        const convertedBookings = filteredAppointments.map(appointment => {
          // PENTING: Gunakan durasi 90 menit DEFAULT untuk semua treatment
          // Ini konsisten dengan BedManagement.jsx dan sistem booking
          const duration = 90; // 1 jam 30 menit untuk semua treatment
          
          return {
            date: date,
            startTime: appointment.time, // Format: "HH:MM" dari database
            duration: duration,
            bedsUsed: 1 // Setiap appointment menggunakan 1 bed
          };
        });
        
        console.log('🛏️ Converted bookings:', convertedBookings);
        
        setBookings(convertedBookings);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      setError('Gagal memuat data jadwal. Menggunakan data offline.');
      setBookings([]); // Set empty if error
    } finally {
      setLoading(false);
    }
  };

  // Generate semua slot waktu dari jam buka hingga tutup
  const generateAllTimeSlots = () => {
    const slots = [];
    const interval = 30; // interval 30 menit
    
    for (let hour = CLINIC_HOURS.open; hour < CLINIC_HOURS.close; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        // Skip jika melewati jam tutup
        if (hour === CLINIC_HOURS.close && minute > 0) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Hitung jam selesai
  const calculateEndTime = (startTime, duration = TREATMENT_DURATION) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);
    return date.toTimeString().substring(0, 5);
  };

  // Hitung ketersediaan bed untuk setiap slot waktu
  const calculateBedAvailability = useMemo(() => {
    if (!selectedDate) return {};
    
    const allSlots = generateAllTimeSlots();
    const availability = {};
    
    // Inisialisasi semua slot dengan kapasitas penuh
    allSlots.forEach(slot => {
      availability[slot] = BEDS_CAPACITY;
    });
    
    console.log('🛏️ Calculating bed availability...');
    console.log('📋 Bookings to process:', bookings.length);
    
    // Kurangi bed untuk setiap booking yang ada
    bookings.forEach((booking, index) => {
      if (booking.date === selectedDate) {
        const startTime = booking.startTime;
        const endTime = calculateEndTime(startTime, booking.duration);
        
        console.log(`📌 Booking ${index + 1}: ${startTime} - ${endTime} (${booking.duration} menit)`);
        
        // Kurangi bed untuk setiap slot yang overlap dengan booking
        allSlots.forEach(slot => {
          const slotTime = new Date(`2000-01-01T${slot}:00`);
          const bookingStart = new Date(`2000-01-01T${startTime}:00`);
          const bookingEnd = new Date(`2000-01-01T${endTime}:00`);
          
          // Jika slot berada dalam rentang waktu booking, kurangi bed
          if (slotTime >= bookingStart && slotTime < bookingEnd) {
            const before = availability[slot];
            availability[slot] = Math.max(0, availability[slot] - booking.bedsUsed);
            if (before !== availability[slot]) {
              console.log(`  ⏰ ${slot}: ${before} → ${availability[slot]} bed`);
            }
          }
        });
      }
    });
    
    // Log summary
    const fullSlots = Object.values(availability).filter(v => v === 0).length;
    const availableSlots = Object.values(availability).filter(v => v > 0).length;
    console.log(`📊 Summary: ${availableSlots} slots available, ${fullSlots} slots full`);
    
    return availability;
  }, [selectedDate, bookings]);

  // Cek apakah slot waktu valid untuk booking baru
  const isTimeSlotValid = (startTime) => {
    if (!startTime || !selectedDate) return false;
    
    const endTime = calculateEndTime(startTime);
    const slotEndTime = new Date(`2000-01-01T${endTime}:00`);
    const clinicCloseTime = new Date(`2000-01-01T${CLINIC_HOURS.close.toString().padStart(2, '0')}:00:00`);
    
    // Cek apakah treatment selesai sebelum klinik tutup
    if (slotEndTime > clinicCloseTime) {
      return false;
    }
    
    // Cek ketersediaan bed untuk setiap slot selama treatment
    const allSlots = generateAllTimeSlots();
    const treatmentSlots = [];
    
    // Kumpulkan semua slot selama durasi treatment
    let currentTime = new Date(`2000-01-01T${startTime}:00`);
    const endTimeObj = new Date(`2000-01-01T${endTime}:00`);
    
    while (currentTime < endTimeObj) {
      const slot = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      if (allSlots.includes(slot)) {
        treatmentSlots.push(slot);
      }
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    // Cek apakah ada cukup bed di semua slot
    return treatmentSlots.every(slot => 
      calculateBedAvailability[slot] !== undefined && calculateBedAvailability[slot] > 0
    );
  };

  // Dapatkan jumlah bed tersedia untuk slot tertentu
  const getAvailableBedsForSlot = (time) => {
    return calculateBedAvailability[time] || 0;
  };

  // Generate semua slot waktu dengan info ketersediaan
  const getAllTimeSlotsWithAvailability = () => {
    if (!selectedDate) return [];
    
    return generateAllTimeSlots().map(slot => {
      const endTime = calculateEndTime(slot);
      const slotEndTime = new Date(`2000-01-01T${endTime}:00`);
      const clinicCloseTime = new Date(`2000-01-01T${CLINIC_HOURS.close.toString().padStart(2, '0')}:00:00`);
      
      // Cek apakah treatment selesai sebelum klinik tutup
      const exceedsClosingTime = slotEndTime > clinicCloseTime;
      
      // Cek ketersediaan bed
      const availableBeds = getAvailableBedsForSlot(slot);
      const hasAvailableBeds = availableBeds > 0;
      
      return {
        time: slot,
        availableBeds: availableBeds,
        isAvailable: hasAvailableBeds && !exceedsClosingTime,
        exceedsClosingTime: exceedsClosingTime
      };
    });
  };

  // Format date from DD/MM/YYYY to YYYY-MM-DD for storage
  const formatDateForStorage = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return '';
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
  };

  // Validate DD/MM/YYYY format
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
    
    // Validate actual date
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getFullYear() === yearNum && 
           date.getMonth() === monthNum - 1 && 
           date.getDate() === dayNum;
  };

  const handleDateChange = (value) => {
    // Remove non-numeric characters except /
    let cleaned = value.replace(/[^0-9/]/g, '');
    
    // Auto-format: add / after day and month
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned = cleaned + '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
      cleaned = cleaned + '/';
    }
    
    // Limit to 10 characters (DD/MM/YYYY)
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    
    setDisplayDate(cleaned);
    
    // If complete date format, validate and convert
    if (cleaned.length === 10 && isValidDateFormat(cleaned)) {
      const storageDate = formatDateForStorage(cleaned);
      
      // Check if date is not in the past
      const selectedDateObj = new Date(storageDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDateObj >= today) {
        setSelectedDate(storageDate);
        setSelectedTime(''); // Reset waktu ketika tanggal berubah
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

  // Handle date picker change (from calendar)
  const handleDatePickerChange = (e) => {
    const dateValue = e.target.value; // Format: YYYY-MM-DD
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
      alert("Slot waktu tidak tersedia. Silakan pilih waktu lain.");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user data from localStorage
      const activeUser = JSON.parse(localStorage.getItem('active_user'));
      
      if (!activeUser || !activeUser.id) {
        alert("User tidak ditemukan. Silakan login kembali.");
        navigate('/auth/login');
        return;
      }
      
      // Convert price from "685.000" format to number
      const priceString = treatment.price?.toString().replace(/\./g, '') || '0';
      const priceNumber = parseInt(priceString);
      
      // Prepare appointment data
      const appointmentData = {
        member_id: activeUser.id,
        customer_name: activeUser.name,
        treatment_id: treatment.id,
        therapist_id: null, // Will be assigned by admin or system
        date: selectedDate,
        time: selectedTime,
        amount: priceNumber,
        status: 'confirmed'
      };
      
      console.log('📝 Creating appointment:', appointmentData);
      
      // Create appointment in database
      const response = await appointmentAPI.create(appointmentData);
      
      if (response.data && response.data.success) {
        const createdAppointment = response.data.data;
        
        console.log('✅ Appointment created:', createdAppointment);
        
        // Prepare data for success page
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
      console.error('❌ Error creating appointment:', err);
      alert('Gagal membuat appointment. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Format tanggal untuk display
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
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans text-[#3E2723]">
      
      {/* NAVBAR */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
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

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 text-left">
            
            {/* HEADER SECTION */}
            <div className="mb-10 text-left">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-[#5D4037] mb-3 tracking-tighter">Tentukan Jadwal</h1>
              <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed font-sans font-medium">
                Pilih tanggal dan waktu kunjungan Anda. Sistem akan menyesuaikan dengan ketersediaan bed dan jam operasional klinik!
              </p>
            </div>

            <div className="space-y-10 mt-8">
              {/* 1. INPUT TANGGAL */}
              <div>
                <label className="text-[10px] font-black text-[#5D4037] mb-4 uppercase flex items-center gap-2 tracking-widest font-sans ml-1">
                  <CalendarIcon size={14} className="text-[#8D6E63]" /> 1. Pilih Tanggal Perawatan
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    {/* Input tanggal dengan icon kalender di dalam */}
                    <div className="w-full lg:w-2/3 relative group">
                      {/* Text input for manual entry with DD/MM/YYYY format */}
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
                      
                      {/* Calendar picker overlay - icon di dalam input */}
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
                            <CalendarIcon size={20} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Tooltip on hover - desktop only */}
                      <div className="hidden md:block absolute -top-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                          Klik untuk buka kalender
                        </div>
                      </div>
                    </div>
                    
                    {/* Display selected date */}
                    {selectedDate && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-[20px] text-sm text-green-700 font-medium w-full lg:w-auto animate-fadeIn">
                        <CalendarIcon size={16} />
                        <span className="text-xs md:text-sm">{formatSelectedDate()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Helper text */}
                  <div className="text-xs text-gray-500 ml-2 space-y-1">
                    {!displayDate && (
                      <>
                        <p className="flex items-center gap-2">
                          <span>💡</span>
                          <span><span className="font-bold">Ketik manual</span> (DD/MM/YYYY) atau <span className="font-bold text-[#8D6E63]">klik icon 📅</span> di kanan untuk buka kalender</span>
                        </p>
                      </>
                    )}
                    {displayDate && displayDate.length < 10 && (
                      <p className="text-blue-600">⌨️ Terus ketik untuk melengkapi tanggal...</p>
                    )}
                    {displayDate.length === 10 && !selectedDate && dateError && (
                      <p className="text-red-600">❌ {dateError}</p>
                    )}
                    {selectedDate && (
                      <p className="text-green-600 font-medium flex items-center gap-1">
                        <span>✅</span>
                        <span>Tanggal valid - Silakan pilih waktu di bawah</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. PILIH JAM */}
              <div>
                <label className="text-[10px] font-black text-[#5D4037] mb-4 uppercase flex items-center gap-2 tracking-widest font-sans ml-1">
                  <Clock size={14} className="text-[#8D6E63]" /> 2. Pilih Jam Mulai
                </label>
                
                {!selectedDate ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Silakan pilih tanggal terlebih dahulu</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Loader2 className="animate-spin text-[#8D6E63] mx-auto mb-4" size={48} />
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
                        const { time, availableBeds, isAvailable, exceedsClosingTime } = slot;
                        const isSelected = selectedTime === time;
                        
                        // Tentukan warna indikator berdasarkan ketersediaan
                        let indicatorColor = '';
                        let statusText = '';
                        
                        if (!isAvailable) {
                          if (exceedsClosingTime) {
                            indicatorColor = 'bg-gray-400';
                            statusText = 'TUTUP';
                          } else if (availableBeds === 0) {
                            indicatorColor = 'bg-red-500';
                            statusText = 'PENUH';
                          }
                        } else if (availableBeds === 1) {
                          indicatorColor = 'bg-amber-500';
                          statusText = '1 BED';
                        } else if (availableBeds === 2) {
                          indicatorColor = 'bg-blue-500';
                          statusText = '2 BED';
                        } else {
                          indicatorColor = 'bg-green-500';
                          statusText = '3 BED';
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
                                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' 
                                  : 'bg-white border-gray-100 text-[#3E2723] hover:border-[#8D6E63]/50 hover:shadow-md'
                            }`}
                          >
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${indicatorColor}`}></div>
                            <span className={`text-sm font-bold font-display`}>
                              {time}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${
                              isSelected ? 'text-white/70' : !isAvailable ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {statusText}
                            </span>
                            {!isAvailable && !exceedsClosingTime && (
                              <div className="absolute bottom-1 left-2">
                                <Bed size={10} className="text-red-400" />
                              </div>
                            )}
                            {isAvailable && (
                              <div className="absolute bottom-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Bed size={10} className="text-gray-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Informasi jam operasional dan legenda */}
                    <div className="mt-6 p-4 bg-[#FDFBF7] rounded-2xl border border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-gray-600">3 bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium text-gray-600">2 bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-medium text-gray-600">1 bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs font-medium text-gray-600">Penuh</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span className="text-xs font-medium text-gray-600">Tutup</span>
                          </div>
                        </div>
                        
                        <div className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                          ⏰ Jam Operasional: 08:00 - 20:00
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RINGKASAN SIDEBAR */}
        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-200 text-[#3E2723] p-8 rounded-[40px] shadow-lg sticky top-8 text-left">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3 text-[#8D6E63] tracking-tight">
              <Info size={22} /> Ringkasan Booking
            </h3>
            
            <div className="space-y-6 font-sans">
              {/* Treatment Info */}
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
              
              {/* Date Info */}
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
                      <span className="text-gray-600">Terjadwal:</span>
                      <span className="font-bold text-amber-600">{bookings.length} appointment</span>
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
              
              {/* Time Info */}
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
              
              {/* Bed Availability Info */}
              {selectedTime && (
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-blue-800 uppercase font-black mb-1 tracking-widest">Ketersediaan Bed</p>
                      <div className="flex items-center gap-2">
                        <Bed size={16} className="text-blue-600" />
                        <p className="text-sm font-bold text-blue-700">
                          {getAvailableBedsForSlot(selectedTime)} dari {BEDS_CAPACITY} bed tersedia
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      getAvailableBedsForSlot(selectedTime) === 3 ? 'bg-green-500' :
                      getAvailableBedsForSlot(selectedTime) === 2 ? 'bg-blue-500' :
                      getAvailableBedsForSlot(selectedTime) === 1 ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Konfirmasi Button */}
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
                  <Loader2 className="animate-spin" size={18} />
                  <span>Membuat Appointment...</span>
                </>
              ) : selectedDate && selectedTime ? (
                'Konfirmasi Booking'
              ) : (
                'Pilih Tanggal & Waktu'
              )}
            </button>
            
            {/* Informasi tambahan */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[10px] text-gray-500 text-center">
                ⚠️ Pastikan Anda datang 15 menit sebelum waktu booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStep3;

// Saat submit booking
const handleSubmitBooking = async () => {
  try {
    const selectedTreatment = JSON.parse(sessionStorage.getItem('selectedTreatment'));
    
    const appointmentData = {
      customer_name: formData.customerName,
      member_id: formData.memberId || null,
      treatment_id: selectedTreatment.id,
      treatment: selectedTreatment.name,
      therapist_id: formData.therapistId,
      therapist: formData.therapistName,
      date: formData.date,
      time: formData.time,
      amount: parseInt(selectedTreatment.price) || 0, // Ambil price dari treatment
      status: 'confirmed'
    };
    
    const response = await axios.post('http://localhost:5000/api/appointments', appointmentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Success handling
    // ...
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
};