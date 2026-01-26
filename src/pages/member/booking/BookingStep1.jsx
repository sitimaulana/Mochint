import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const BookingStep1 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 flex flex-col items-center font-sans">
      
      {/* NAVBAR SEDERHANA: Hanya Icon Home / Booking */}
      <div className="w-full max-w-5xl mb-16">
        <nav className="flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
          <button 
            onClick={() => navigate('/member')} 
            className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
          >
            <Home size={16} />
          </button>
          <span>/</span>
          <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display">
            Booking
          </span>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-4xl text-left md:text-left">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-[#8D6E63] leading-tight mb-8 tracking-tighter">
          Siap Untuk Self-Care? Reservasi <br /> Sekarang, Gak Pake Ribet!
        </h1>

        {/* INFO CARD */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 mb-10">
          <p className="text-[#5D4037] font-display font-bold text-sm md:text-base mb-6 tracking-tight">
            Buat Janji Temu di Mochint Beauty Care Cuma Butuh Langkah Sat-Set:
          </p>
          
          <ul className="space-y-4 text-gray-500 text-sm md:text-base leading-relaxed font-sans">
            <li className="flex gap-3">
              <span className="font-bold text-[#8D6E63] font-display">1.</span>
              <span className="font-sans font-medium">Tentukan Jadwal: Pilih tanggal dan jam yang tersedia di sistem real-time kami.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#8D6E63] font-display">2.</span>
              <span className="font-sans font-medium">Lengkapi Data: Pastikan data diri dan treatment yang dipilih sudah sesuai.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#8D6E63] font-display">3.</span>
              <span className="font-sans font-medium">Konfirmasi: Selesaikan pesanan dan bed Anda akan otomatis dipesan oleh sistem.</span>
            </li>
          </ul>
        </div>

        {/* ACTION BUTTON: Mengarah langsung ke Step 2 */}
        <button 
          onClick={() => navigate('/member/booking/step-2')}
          className="px-10 py-4 bg-[#8D6E63] text-white font-display font-bold rounded-full shadow-xl shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all transform active:scale-95 uppercase text-[10px] tracking-[0.2em]"
        >
          Mulai Booking
        </button>
      </div>
    </div>
  );
};

export default BookingStep1;