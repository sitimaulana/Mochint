import React from 'react';
import { X, Home, ShoppingBag, ChevronRight, ShieldCheck, Tag } from 'lucide-react';

const ProductDetail = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop - Lebih gelap untuk fokus maksimal */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 z-[1000]">
        
        {/* Header - Kontras Tinggi */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] font-sans">
            <div className="flex items-center gap-2 text-[#8D6E63] hover:text-[#3E2723] transition-colors cursor-pointer">
              <Home size={14} />
              <ChevronRight size={12} className="opacity-30" />
              <span>Skincare</span>
            </div>
            <ChevronRight size={12} className="opacity-30 text-gray-400" />
            <span className="text-[#3E2723] truncate max-w-[150px] md:max-w-none">
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

        {/* Content Area */}
        <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto">
          
          {/* Kolom Kiri: Detail Informasi */}
          <div className="flex-1 p-10 md:p-16 space-y-10 order-2 md:order-1 bg-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8D6E63] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md font-sans">
                <Tag size={12} /> {product.category}
              </div>
              {/* Judul Produk - Poppins */}
              <h2 className="text-3xl md:text-5xl font-display font-bold text-[#3E2723] leading-tight tracking-tight">
                {product.name}
              </h2>
            </div>
            
            {/* Deskripsi - Inter */}
            <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                    <span className="w-10 h-[2px] bg-[#8D6E63]/30"></span> Deskripsi Produk
                </h4>
                <p className="font-sans text-[#4E342E] leading-relaxed text-base font-medium opacity-90">
                {product.longDescription || product.description}
                </p>
            </div>
            
            {/* Spesifikasi Grid - Inter Bold */}
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-100 font-sans">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Berat</p>
                <p className="text-sm font-bold text-[#3E2723]">{product.weight || '10 gr'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Sertifikasi</p>
                <div className="flex items-center gap-1.5 text-[#2E7D32]">
                    <ShieldCheck size={14} />
                    <p className="text-sm font-bold">BPOM</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Harga</p>
                <p className="text-xl font-display font-bold text-[#8D6E63]">Rp {product.price}</p>
              </div>
            </div>

            {/* Action Button - Poppins */}
            <button className="w-full flex items-center justify-center gap-4 px-10 py-5 bg-[#5D4037] text-white rounded-[20px] font-display font-bold text-sm uppercase tracking-widest hover:bg-[#3E2723] transition-all shadow-xl active:scale-95 group">
              <ShoppingBag size={20} className="group-hover:animate-bounce" /> 
              Pesan via WhatsApp
            </button>
          </div>

          {/* Kolom Kanan: Gambar Produk */}
          <div className="flex-1 bg-[#FDFBF7] flex items-center justify-center p-12 order-1 md:order-2 border-b md:border-b-0 md:border-l border-gray-100 relative overflow-hidden">
            {/* Lingkaran Dekoratif Background */}
            <div className="absolute w-80 h-80 bg-[#8D6E63]/5 rounded-full blur-3xl"></div>
            
            <div className="relative group z-10">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-[350px] md:max-h-[480px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            </div>

            {/* Floating Info Box */}
            <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg hidden md:block">
                <p className="text-[9px] font-black text-[#8D6E63] uppercase tracking-widest mb-1 font-sans">Status Stok</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-[#3E2723] font-sans">Tersedia</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;