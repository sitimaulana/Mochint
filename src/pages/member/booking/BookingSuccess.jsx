import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Phone, Mail, Calendar, User, List, CheckCircle } from 'lucide-react';

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Mengambil data booking dari session storage
    const data = sessionStorage.getItem('finalBooking');
    // 2. Mengambil data user yang sedang login dari localStorage (Otomatis)
    const activeUser = JSON.parse(localStorage.getItem('active_user')) || {
      name: 'Siti Maulana',
      id: 'M0001',
      phone: '+62 812-3456-7890',
      address: 'Surabaya, Jawa Timur'
    };

    if (data) {
      setBooking(JSON.parse(data));
      setUser(activeUser);
    } else {
      navigate('/member/booking/step-1'); 
    }
  }, [navigate]);

  if (!booking || !user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      
      {/* NAVBAR SEDERHANA */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-10 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')} 
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display font-bold lowercase first-letter:uppercase">
          Appointment
        </span>
      </nav>

      <div className="max-w-6xl mx-auto text-left">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-[#8D6E63] mb-2 tracking-tighter leading-tight">Detail Appointment</h1>
        <p className="text-gray-500 mb-12 text-sm md:text-base leading-relaxed font-sans font-medium">
          Tampil memukau setiap hari dengan solusi kecantikan modern yang disesuaikan hanya untuk Anda!
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* KIRI: RINCIAN APPOINTMENT */}
          <div className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-display font-bold text-[#5D4037] tracking-tight">Rincian</h2>
              <span className="px-5 py-1.5 bg-[#4CAF50] text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm font-sans">
                <CheckCircle size={12} /> Confirmed
              </span>
            </div>

            {/* Box Highlight Waktu */}
            <div className="bg-[#8D6E63] p-10 rounded-[30px] text-white mb-10 shadow-xl shadow-[#8D6E63]/20 flex flex-col justify-center gap-2">
              <div className="flex items-center gap-3 opacity-90 font-sans">
                <Calendar size={20} />
                <p className="text-lg font-bold">
                   {new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <h3 className="text-5xl font-display font-bold tracking-tighter">{booking.startTime}</h3>
            </div>

            {/* Grid Data Pasien & Layanan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 border-b border-gray-100 pb-10 font-sans text-left">
              <div className="flex gap-4">
                <div className="text-[#8D6E63] bg-[#FDFBF7] p-2 rounded-lg h-fit"><User size={20} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Nama Pasien</p>
                  <p className="text-sm font-bold text-[#5D4037] font-display">{user.name}</p>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">{user.phone}</p>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ID Member</p>
                <p className="text-sm font-bold text-[#5D4037] font-display">{user.id}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-medium">{user.address}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-[#8D6E63] bg-[#FDFBF7] p-2 rounded-lg h-fit"><List size={20} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Layanan</p>
                  <p className="text-sm font-bold text-[#5D4037] font-display">{booking.name}</p>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Biaya Perawatan</p>
                <p className="text-lg font-bold text-[#8D6E63] font-display">Rp {booking.price}</p>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-8 flex justify-between items-center text-2xl font-display font-bold text-[#5D4037]">
              <span>Total Biaya:</span>
              <span className="text-[#8D6E63]">Rp {booking.price}</span>
            </div>
          </div>

          {/* KANAN: KONTAK & PETA */}
          <div className="w-full lg:w-96 space-y-6 text-left">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden font-sans">
              <div className="h-44 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80" 
                  alt="Location Map" 
                  className="w-full h-full object-cover grayscale opacity-70"
                />
              </div>
              <div className="p-8 bg-[#8D6E63] text-white">
                <h4 className="font-display font-bold text-sm mb-2 uppercase tracking-wide">Mochint Beauty Care Pandaan</h4>
                <p className="text-[10px] leading-relaxed opacity-80 font-medium font-sans">
                  Jl. Sidomukti No.13 RT03, RW04, Pesantren, Pandaan, Pasuruan, Jawa Timur 67156
                </p>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#FDFBF7] rounded-lg text-[#8D6E63]"><Phone size={18} /></div>
                  <p className="text-xs font-bold text-[#5D4037] font-sans">+62 819-9420-4009</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#FDFBF7] rounded-lg text-[#8D6E63]"><Mail size={18} /></div>
                  <p className="text-xs font-bold text-[#5D4037] font-sans">mochint@gmail.com</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/member')}
              className="w-full py-5 bg-[#8D6E63] text-white font-display font-bold rounded-[20px] shadow-xl shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all uppercase text-[10px] tracking-[0.2em]"
            >
              Appointment List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;