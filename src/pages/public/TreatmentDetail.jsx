import React from 'react';
import { X, Home, ChevronRight, Sparkles, Clock, CircleDot } from 'lucide-react';

const TreatmentDetail = ({ isOpen, onClose, treatment }) => {
  if (!isOpen || !treatment) return null;

  // Helper untuk format Rupiah agar rapi
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop - Dibuat lebih gelap sedikit agar fokus ke modal */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 z-[1000] flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        
        {/* KOLOM KIRI: Informasi Detail */}
        <div className="flex-[1.2] flex flex-col h-full bg-white">
          
          {/* Header & Breadcrumbs */}
          <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
            <nav className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8D6E63] font-sans">
              <Home size={14} />
              <ChevronRight size={12} className="opacity-30" />
              <span>Layanan</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-[#3E2723]">
                {treatment.name}
              </span>
            </nav>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-[#FDFBF7] text-[#5D4037] hover:bg-[#8D6E63] hover:text-white rounded-full transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-10 md:p-14 overflow-y-auto space-y-10">
            {/* Title Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8D6E63] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                <Sparkles size={12} /> {treatment.category}
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-[#3E2723] leading-tight tracking-tight">
                {treatment.name}
              </h2>
            </div>

            {/* Deskripsi */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                <span className="w-10 h-[2px] bg-[#8D6E63]/30"></span> Detail Layanan
              </h4>
              <p className="font-sans text-[#4E342E] leading-relaxed text-lg font-medium opacity-90">
                {treatment.description}
              </p>
            </div>

            {/* Fasilitas - Mengambil data ARRAY dari database */}
            <div className="space-y-5">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                <span className="w-10 h-[2px] bg-[#8D6E63]/30"></span> Fasilitas Premium
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatment.facilities && treatment.facilities.length > 0 ? (
                  treatment.facilities.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 px-5 py-3 bg-[#FDFBF7] border-l-4 border-[#8D6E63] rounded-r-2xl text-[12px] font-bold text-[#5D4037] font-sans shadow-sm"
                    >
                      <CircleDot size={12} className="text-[#8D6E63]" />
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Fasilitas informasi akan segera diperbarui.</p>
                )}
              </div>
            </div>

            {/* Harga & Durasi - Sinkron Database */}
            <div className="pt-10 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-[#A1887F] uppercase tracking-widest mb-1 font-sans">Estimasi Investasi</p>
                <p className="text-3xl font-display font-bold text-[#8D6E63]">Rp {formatPrice(treatment.price)}</p>
              </div>
              <div className="px-6 py-3 bg-[#5D4037] text-white rounded-2xl flex items-center gap-3 shadow-lg">
                <Clock size={18} className="text-[#D7CCC8]" />
                <span className="text-[12px] font-bold font-sans">{treatment.duration || '60 - 90 Menit'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Foto Treatment */}
        <div className="flex-1 relative min-h-[400px] md:min-h-full order-1 md:order-2">
          <img 
            src={treatment.image} 
            alt={treatment.name} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Gradient Overlay agar gambar lebih dramatis */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/40 to-transparent"></div>
          <div className="absolute inset-0 border-l-[1px] border-white/10 hidden md:block"></div>
        </div>

      </div>
    </div>
  );
};

export default TreatmentDetail;