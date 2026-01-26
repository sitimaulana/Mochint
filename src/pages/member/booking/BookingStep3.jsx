import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, Clock, Info } from 'lucide-react';

const BookingStep3 = () => {
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [treatment, setTreatment] = useState(null);

  useEffect(() => {
    const savedTreatment = sessionStorage.getItem('selectedTreatment');
    if (savedTreatment) {
      setTreatment(JSON.parse(savedTreatment));
    } else {
      navigate('/member/booking/step-2');
    }
  }, [navigate]);

  const BEDS_CAPACITY = 3;
  const TREATMENT_DURATION = 90; 
  
  const occupancyData = {
    "10:00": 3, "10:30": 3, "11:00": 2, "13:00": 3, "14:00": 1, "18:30": 0
  };

  const generateTimeSlots = () => {
    const slots = [];
    let current = new Date(`2026-01-01T08:00:00`);
    const end = new Date(`2026-01-01T18:30:00`);
    while (current <= end) {
      slots.push(current.toTimeString().substring(0, 5));
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date(2026, 0, 1, hours, minutes);
    date.setMinutes(date.getMinutes() + TREATMENT_DURATION);
    return date.toTimeString().substring(0, 5);
  };

  const handleNextStep = () => {
    if (!selectedDate || !selectedTime) {
        alert("Silakan pilih tanggal dan jam terlebih dahulu!");
        return;
    }
    const finalData = {
      ...treatment,
      date: selectedDate,
      startTime: selectedTime,
      endTime: calculateEndTime(selectedTime),
      duration: "1.5 Jam"
    };
    sessionStorage.setItem('finalBooking', JSON.stringify(finalData));
    navigate('/member/booking/success');
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
                Tampil memukau setiap hari dengan solusi kecantikan modern yang disesuaikan hanya untuk Anda!
              </p>
            </div>

            <div className="space-y-10 mt-8">
              {/* 1. INPUT TANGGAL (PENGGUNAAN FONT-SANS) */}
              <div>
                <label className="text-[10px] font-black text-[#5D4037] mb-4 uppercase flex items-center gap-2 tracking-widest font-sans ml-1">
                  <CalendarIcon size={14} className="text-[#8D6E63]" /> 1. Pilih Tanggal Perawatan
                </label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full md:w-1/2 px-8 py-4 bg-[#FDFBF7] border-2 border-transparent rounded-[20px] outline-none focus:border-[#8D6E63] font-bold text-[#3E2723] font-sans appearance-none cursor-pointer"
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* 2. PILIH JAM */}
              <div>
                <label className="text-[10px] font-black text-[#5D4037] mb-4 uppercase flex items-center gap-2 tracking-widest font-sans ml-1">
                  <Clock size={14} className="text-[#8D6E63]" /> 2. Pilih Jam Mulai
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {generateTimeSlots().map((time) => {
                    const booked = occupancyData[time] || 0;
                    const isFull = booked >= BEDS_CAPACITY;
                    const indicatorColor = isFull ? 'bg-red-500' : booked === 2 ? 'bg-amber-500' : 'bg-green-500';
                    return (
                      <button
                        key={time}
                        disabled={isFull}
                        onClick={() => setSelectedTime(time)}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 font-sans ${
                          selectedTime === time 
                          ? 'bg-[#3E2723] border-[#3E2723] text-white shadow-md scale-105 z-10' 
                          : isFull ? 'bg-gray-50 border-transparent opacity-30 cursor-not-allowed' : 'bg-white border-gray-100 text-[#3E2723] hover:border-[#8D6E63]/30'
                        }`}
                      >
                        <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${indicatorColor}`}></div>
                        <span className="text-sm font-bold font-display">{time}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${selectedTime === time ? 'text-white/70' : 'text-gray-400'}`}>
                          {isFull ? 'FULL' : `${3-booked} Bed`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RINGKASAN SIDEBAR */}
        <div className="w-full lg:w-96">
          <div className="bg-[#3E2723] text-white p-8 rounded-[40px] shadow-2xl sticky top-8 text-left">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3 text-[#8D6E63] tracking-tight">
              <Info size={22} /> Ringkasan
            </h3>
            <div className="space-y-6 font-sans">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <p className="text-[9px] text-[#8D6E63] uppercase font-black mb-1.5 tracking-widest">Treatment</p>
                <p className="text-sm font-bold leading-snug">{treatment?.name || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <p className="text-[9px] text-[#8D6E63] uppercase font-black mb-1.5 tracking-widest">Mulai</p>
                  <p className="text-lg font-bold font-display">{selectedTime || "--:--"}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  <p className="text-[9px] text-[#8D6E63] uppercase font-black mb-1.5 tracking-widest">Selesai</p>
                  <p className="text-lg font-bold font-display text-green-400">{calculateEndTime(selectedTime) || "--:--"}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleNextStep}
              disabled={!selectedDate || !selectedTime}
              className={`w-full mt-10 py-5 rounded-[20px] font-display font-bold uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl ${
                selectedDate && selectedTime 
                ? 'bg-[#8D6E63] text-white hover:bg-white hover:text-[#3E2723] active:scale-95 shadow-[#8D6E63]/20' 
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStep3;