import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Calendar, Clock, MapPin, CheckCircle, Printer, ArrowLeft } from 'lucide-react';
import { mockAppointments } from '../../api/mockData';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id && mockAppointments) {
      const foundData = mockAppointments.find(item => item.id === id);
      setData(foundData || null);
    }
  }, [id]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-sans">
      <div className="text-center">
        <p className="font-bold text-[#8D6E63] mb-4 font-display text-xl tracking-tight">Data tidak ditemukan...</p>
        <button onClick={() => navigate('/member/appointment')} className="text-sm text-gray-500 font-sans hover:text-[#8D6E63] transition-colors">Kembali ke Daftar</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      {/* NAVBAR: Menggunakan font-display untuk label aktif */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')} 
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <button 
          onClick={() => navigate('/member/appointment')} 
          className="hover:text-[#8D6E63] transition-colors font-sans"
        >
          Appointment
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display lowercase first-letter:uppercase">
          Detail
        </span>
      </nav>

      <div className="max-w-3xl mx-auto">
        {/* KARTU DETAIL */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden text-left">
          
          {/* Header Status - Font Display (Poppins) */}
          <div className={`p-8 md:p-10 flex justify-between items-center text-white ${
            data.status === 'Pending' ? 'bg-[#A67B7B]' : 'bg-[#6DA67C]'
          }`}>
            <div>
              <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-1 font-sans">Status Appointment</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter leading-none">{data.status}</h2>
            </div>
            <CheckCircle size={48} className="opacity-25" />
          </div>

          <div className="p-8 md:p-12 space-y-10">
            {/* Bagian Utama: Layanan & ID */}
            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-50 pb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-sans">Layanan Perawatan</label>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-[#8D6E63] leading-tight tracking-tighter">
                  {data.treatmentName}
                </h3>
              </div>
              <div className="text-left md:text-right space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-sans">ID Booking</label>
                <p className="text-xl font-display font-bold text-[#5D4037]">#{data.id}</p>
              </div>
            </div>

            {/* Bagian Kedua: Waktu & Lokasi - Font Sans (Inter) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[#5D4037]">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#8D6E63] border border-[#8D6E63]/10">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Tanggal</p>
                    <p className="font-sans font-bold text-sm md:text-base">{data.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#5D4037]">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#8D6E63] border border-[#8D6E63]/10">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Waktu</p>
                    <p className="font-sans font-bold text-sm md:text-base">10:00 WIB - Selesai</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[#5D4037]">
                  <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#8D6E63] border border-[#8D6E63]/10">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Lokasi</p>
                    <p className="font-sans font-bold text-sm md:text-base">Mochint Pandaan</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#5D4037]">
                   <div className="p-3 bg-[#FDFBF7] rounded-2xl text-[#8D6E63] border border-[#8D6E63]/10">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Nama Pasien</p>
                    <p className="font-sans font-bold text-sm md:text-base">Siti Maulana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Akhir: Biaya */}
            <div className="pt-10 border-t border-dashed border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 font-sans">Total Pembayaran</p>
                <p className="text-4xl font-display font-bold text-[#8D6E63] tracking-tighter">{data.price}</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto font-sans">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all text-[11px] uppercase tracking-widest font-sans"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[#8D6E63] text-white font-bold rounded-2xl shadow-lg shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all text-[11px] uppercase tracking-widest font-sans"
                >
                  <Printer size={16} /> Cetak
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alamat Klinik */}
        <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed max-w-md mx-auto italic uppercase tracking-[0.2em] font-sans font-medium">
          Jl. Sidomukti No.13 RT03, RW04, Pesantren, Pandaan, Kec. Pandaan, Pasuruan, Jawa Timur 67156
        </p>
      </div>
    </div>
  );
};

export default AppointmentDetail;