import React from 'react';
import { X, Home, ChevronRight, Sparkles, Clock, CircleDot, ArrowLeft } from 'lucide-react';

const TreatmentDetail = ({ isOpen, onClose, treatment }) => {
  if (!isOpen || !treatment) return null;

  // Helper untuk format Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Fungsi untuk cek apakah promo aktif
  const isPromoActive = () => {
    if (!treatment.discount_percentage || treatment.discount_percentage <= 0) return false;
    if (!treatment.promo_start_date || !treatment.promo_end_date) return false;
    
    const now = new Date();
    const startDate = new Date(treatment.promo_start_date);
    const endDate = new Date(treatment.promo_end_date);
    
    return now >= startDate && now <= endDate;
  };

  // Fungsi untuk hitung harga setelah diskon
  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discount = (price * discountPercentage) / 100;
    return price - discount;
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      {/* Main Container - FIXED MAX HEIGHT */}
      <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl bg-white md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0 duration-300 z-[1000] flex flex-col md:flex-row">
        
        {/* ✨ MOBILE HEADER - Sticky di atas image */}
        <div className="md:hidden absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="p-2 bg-white/90 backdrop-blur-sm text-[#3E2723] rounded-full shadow-lg active:scale-95 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-white text-xs font-bold tracking-wider uppercase px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                {treatment.category}
              </span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* ✨ MOBILE IMAGE - Full width di top */}
        <div className="md:hidden relative w-full h-64 sm:h-80 flex-shrink-0">
          <img 
            src={treatment.image} 
            alt={treatment.name} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          {/* Promo Badge - Mobile */}
          {isPromoActive() && (
            <div className="absolute top-20 right-4 bg-red-500 text-white px-3 py-2 rounded-xl shadow-lg z-20">
              <p className="text-xs font-black uppercase tracking-tight">
                HEMAT {treatment.discount_percentage}%
              </p>
            </div>
          )}
        </div>

        {/* ✨ KOLOM KIRI: Informasi Detail */}
        <div className="flex-[1.2] flex flex-col bg-white h-full overflow-hidden">
          
          {/* ✨ DESKTOP Header - NO SCROLL */}
          <div className="hidden md:block p-6 lg:p-8 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <nav className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8D6E63] font-sans">
                <Home size={14} />
                <ChevronRight size={12} className="opacity-30" />
                <span>Layanan</span>
                <ChevronRight size={12} className="opacity-30" />
                <span className="text-[#3E2723] truncate max-w-[150px]">
                  {treatment.name}
                </span>
              </nav>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-[#FDFBF7] text-[#5D4037] hover:bg-[#8D6E63] hover:text-white rounded-full transition-all shadow-sm active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ✨ SCROLLABLE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-5 sm:p-6 lg:p-10 xl:p-14 space-y-6 sm:space-y-8 lg:space-y-10">
              
              {/* Title Section */}
              <div className="space-y-3 sm:space-y-4">
                {/* Desktop Category Badge */}
                <div className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 bg-[#8D6E63] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  <Sparkles size={12} /> {treatment.category}
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-[#3E2723] leading-tight tracking-tight">
                  {treatment.name}
                </h2>
              </div>

              {/* ✨ MOBILE Price & Duration - Top */}
              <div className="md:hidden grid grid-cols-2 gap-3 pb-6 border-b border-gray-100">
                <div className="bg-[#FDFBF7] p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-wider mb-1">Harga</p>
                  {isPromoActive() ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 line-through font-medium">
                        Rp {formatPrice(treatment.price)}
                      </p>
                      <p className="text-xl sm:text-2xl font-display font-bold text-red-600">
                        Rp {formatPrice(calculateDiscountedPrice(treatment.price, treatment.discount_percentage))}
                      </p>
                      <div className="inline-block px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
                        HEMAT {treatment.discount_percentage}%
                      </div>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-display font-bold text-[#8D6E63]">
                      Rp {formatPrice(treatment.price)}
                    </p>
                  )}
                </div>
                <div className="bg-[#5D4037] p-4 rounded-2xl flex flex-col justify-center items-center text-white">
                  <Clock size={20} className="text-[#D7CCC8] mb-1" />
                  <span className="text-[11px] font-bold text-center leading-tight">
                    {treatment.duration || '60-90 Menit'}
                  </span>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                  <span className="w-8 sm:w-10 h-[2px] bg-[#8D6E63]/30"></span> Detail Layanan
                </h4>
                <p className="font-sans text-[#4E342E] leading-relaxed text-base sm:text-lg font-medium opacity-90">
                  {treatment.description}
                </p>
              </div>

              {/* Fasilitas */}
              <div className="space-y-4 sm:space-y-5">
                <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                  <span className="w-8 sm:w-10 h-[2px] bg-[#8D6E63]/30"></span> Fasilitas Premium
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {treatment.facilities && treatment.facilities.length > 0 ? (
                    treatment.facilities.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 bg-[#FDFBF7] border-l-4 border-[#8D6E63] rounded-r-xl sm:rounded-r-2xl text-[11px] sm:text-[12px] font-bold text-[#5D4037] font-sans shadow-sm"
                      >
                        <CircleDot size={12} className="text-[#8D6E63] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">Fasilitas informasi akan segera diperbarui.</p>
                  )}
                </div>
              </div>

              {/* ✨ DESKTOP Harga & Durasi */}
              <div className="hidden md:flex pt-8 lg:pt-10 border-t border-gray-100 items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-[#A1887F] uppercase tracking-widest mb-2 font-sans">Harga</p>
                  {isPromoActive() ? (
                    <div className="space-y-1">
                      <p className="text-lg text-gray-400 line-through font-medium">
                        Rp {formatPrice(treatment.price)}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl lg:text-3xl font-display font-bold text-red-600">
                          Rp {formatPrice(calculateDiscountedPrice(treatment.price, treatment.discount_percentage))}
                        </p>
                        <div className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          HEMAT {treatment.discount_percentage}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-2xl lg:text-3xl font-display font-bold text-[#8D6E63]">
                      Rp {formatPrice(treatment.price)}
                    </p>
                  )}
                </div>
                <div className="px-4 lg:px-6 py-2 lg:py-3 bg-[#5D4037] text-white rounded-xl lg:rounded-2xl flex items-center gap-3 shadow-lg">
                  <Clock size={18} className="text-[#D7CCC8]" />
                  <span className="text-[11px] lg:text-[12px] font-bold font-sans">
                    {treatment.duration || '60 - 90 Menit'}
                  </span>
                </div>
              </div>

              {/* Bottom Spacing */}
              <div className="h-8"></div>
            </div>
          </div>

          {/* ✨ MOBILE CTA Button */}
          <div className="md:hidden bg-white border-t border-gray-100 p-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#8D6E63] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* ✨ DESKTOP KOLOM KANAN: Foto Treatment */}
        <div className="hidden md:block flex-1 relative overflow-hidden">
          <img 
            src={treatment.image} 
            alt={treatment.name} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/40 to-transparent"></div>
          <div className="absolute inset-0 border-l-[1px] border-white/10"></div>
          {/* Promo Badge - Desktop */}
          {isPromoActive() && (
            <div className="absolute top-8 right-8 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl z-20">
              <p className="text-sm font-black uppercase tracking-tight mb-1">
                PROMO SPESIAL
              </p>
              <p className="text-2xl font-black">
                {treatment.discount_percentage}% OFF
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TreatmentDetail;