import React from 'react';
import { X, Home, ShoppingBag, ChevronRight, ShieldCheck, Tag, ExternalLink, ArrowLeft } from 'lucide-react';

const ProductDetail = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price);
  };

  // Fungsi untuk cek apakah promo aktif
  const isPromoActive = (product) => {
    if (!product.discount_percentage || product.discount_percentage <= 0) return false;
    if (!product.promo_start_date || !product.promo_end_date) return false;
    
    const now = new Date();
    const startDate = new Date(product.promo_start_date);
    const endDate = new Date(product.promo_end_date);
    
    return now >= startDate && now <= endDate;
  };

  // Fungsi untuk hitung harga setelah diskon
  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discount = (price * discountPercentage) / 100;
    return price - discount;
  };

  // Cek apakah ada setidaknya satu link marketplace
  const hasMarketplace = product.marketplaceLinks && 
    Object.values(product.marketplaceLinks).some(link => link !== '' && link !== null);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* Container */}
      <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl bg-white md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom md:slide-in-from-bottom-0 duration-300 z-[1000] flex flex-col md:flex-row">
        
        {/* Mobile Header - Absolute over image */}
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
                {product.category}
              </span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Mobile Image - Top */}
        <div className="md:hidden relative w-full h-64 sm:h-80 flex-shrink-0 bg-[#FDFBF7]">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-full w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)]" 
            />
          </div>
          {isPromoActive(product) && (
            <div className="absolute top-4 right-4 z-10 bg-red-500 px-3 py-1.5 rounded-full shadow-lg">
              <p className="text-[10px] font-black uppercase text-white">
                PROMO {product.discount_percentage}%
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kiri: Detail Informasi */}
        <div className="flex-1 md:flex-[1.3] flex flex-col bg-white overflow-hidden">
          
          {/* Desktop Header - Fixed */}
          <div className="hidden md:block p-5 lg:p-6 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] font-sans text-[#8D6E63]">
                <Home size={14} />
                <ChevronRight size={12} className="opacity-30" />
                <span>Skincare</span>
                <ChevronRight size={12} className="opacity-30" />
                <span className="text-[#3E2723] truncate max-w-[150px] lg:max-w-[200px]">
                  {product.name}
                </span>
              </nav>
              
              <button 
                onClick={onClose} 
                className="p-2.5 bg-[#FDFBF7] hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-[#5D4037] shadow-sm group"
              >
                <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-5 sm:p-6 lg:p-10 xl:p-12 space-y-6 lg:space-y-8">
              
              {/* Title Section */}
              <div className="space-y-3">
                <div className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 bg-[#8D6E63] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md font-sans">
                  <Tag size={12} /> {product.category}
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-[#3E2723] leading-tight tracking-tight">
                  {product.name}
                </h2>
              </div>
              
              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                  <span className="w-8 lg:w-10 h-[2px] bg-[#8D6E63]/30"></span> Deskripsi Produk
                </h4>
                <p className="font-sans text-[#4E342E] leading-relaxed text-sm sm:text-base lg:text-lg font-medium opacity-90">
                  {product.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>
              
              {/* Product Info Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 py-6 lg:py-8 border-y border-gray-100 font-sans">
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Berat</p>
                  <p className="text-xs sm:text-sm font-bold text-[#3E2723]">
                    {product.weight ? `${product.weight} gr` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Sertifikasi</p>
                  <div className="flex items-center gap-1.5 text-[#2E7D32]">
                    <ShieldCheck size={12} className="sm:w-[14px] sm:h-[14px]" />
                    <p className="text-xs sm:text-sm font-bold">BPOM</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Harga</p>
                  {isPromoActive(product) ? (
                    <div className="space-y-0.5">
                      <p className="text-[10px] sm:text-xs font-bold text-gray-400 line-through">
                        Rp {formatPrice(product.price)}
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-display font-bold text-red-600">
                        Rp {formatPrice(calculateDiscountedPrice(product.price, product.discount_percentage))}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg lg:text-xl font-display font-bold text-[#8D6E63]">
                      Rp {formatPrice(product.price)}
                    </p>
                  )}
                </div>
              </div>

              {/* Promo Banner */}
              {isPromoActive(product) && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-red-500 p-2 rounded-full">
                      <Tag size={16} className="text-white" />
                    </div>
                    <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-red-700">
                      🎉 Promo Spesial Aktif!
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm font-medium text-red-800">
                    <p>Dapatkan diskon <span className="font-black text-red-600">{product.discount_percentage}%</span> untuk produk ini</p>
                    <p className="text-[10px] sm:text-xs text-red-600">
                      Berlaku: {new Date(product.promo_start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(product.promo_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Marketplace Links */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] font-sans">
                  Beli Produk di:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Shopee */}
                  {product.marketplaceLinks?.shopee && (
                    <a 
                      href={product.marketplaceLinks.shopee} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#EE4D2D] text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#d73211] transition-all shadow-lg group active:scale-95"
                    >
                      Shopee 
                      <ExternalLink size={14} className="sm:w-[16px] sm:h-[16px] group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {/* Tokopedia */}
                  {product.marketplaceLinks?.tokopedia && (
                    <a 
                      href={product.marketplaceLinks.tokopedia} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#42B549] text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#36943c] transition-all shadow-lg group active:scale-95"
                    >
                      Tokopedia 
                      <ExternalLink size={14} className="sm:w-[16px] sm:h-[16px] group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {/* Lazada */}
                  {product.marketplaceLinks?.lazada && (
                    <a 
                      href={product.marketplaceLinks.lazada} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#0F146D] text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#080b4d] transition-all shadow-lg group active:scale-95"
                    >
                      Lazada 
                      <ExternalLink size={14} className="sm:w-[16px] sm:h-[16px] group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}

                  {/* WhatsApp Fallback */}
                  {!hasMarketplace && (
                    <a 
                      href={`https://wa.me/628123456789?text=Halo Mochint, saya tertarik dengan produk ${product.name}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="col-span-full flex items-center justify-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-[#5D4037] text-white rounded-xl sm:rounded-[20px] font-display font-bold text-sm uppercase tracking-widest hover:bg-[#3E2723] transition-all shadow-xl group active:scale-95"
                    >
                      <ShoppingBag size={18} className="sm:w-[20px] sm:h-[20px]" /> 
                      Pesan via WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Spacing */}
              <div className="h-4"></div>
            </div>
          </div>

          {/* Mobile CTA Button */}
          <div className="md:hidden bg-white border-t border-gray-100 p-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#8D6E63] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Desktop: Kolom Kanan - Image */}
        <div className="hidden md:flex flex-1 bg-[#FDFBF7] items-center justify-center p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute w-60 lg:w-80 h-60 lg:h-80 bg-[#8D6E63]/5 rounded-full blur-3xl"></div>
          <div className="relative group z-10">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-[300px] lg:max-h-[450px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
            {isPromoActive(product) && (
              <div className="absolute -top-4 -right-4 bg-red-500 px-4 py-2 rounded-full shadow-2xl animate-pulse">
                <p className="text-sm font-black uppercase text-white">
                  PROMO {product.discount_percentage}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;