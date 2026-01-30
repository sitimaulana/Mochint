import React from 'react';
import { X, Home, ShoppingBag, ChevronRight, ShieldCheck, Tag, ExternalLink } from 'lucide-react';

const ProductDetail = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  // Cek apakah ada setidaknya satu link marketplace
  const hasMarketplace = product.marketplaceLinks && 
    Object.values(product.marketplaceLinks).some(link => link !== '' && link !== null);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      ></div>

      {/* Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 z-[1000]">
        
        {/* Header */}
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

        <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto">
          
          {/* Kolom Kiri: Detail Informasi */}
          <div className="flex-1 p-10 md:p-16 space-y-10 order-2 md:order-1 bg-white">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8D6E63] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md font-sans">
                <Tag size={12} /> {product.category}
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-[#3E2723] leading-tight tracking-tight">
                {product.name}
              </h2>
            </div>
            
            <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] flex items-center gap-3 font-sans">
                    <span className="w-10 h-[2px] bg-[#8D6E63]/30"></span> Deskripsi Produk
                </h4>
                <p className="font-sans text-[#4E342E] leading-relaxed text-base font-medium opacity-90">
                {product.description || "Tidak ada deskripsi tersedia."}
                </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-gray-100 font-sans">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest">Berat</p>
                <p className="text-sm font-bold text-[#3E2723]">{product.weight ? `${product.weight} gr` : 'N/A'}</p>
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
                <p className="text-xl font-display font-bold text-[#8D6E63]">Rp {formatPrice(product.price)}</p>
              </div>
            </div>

            {/* SEKSI LINK ECOMMERCE DINAMIS */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#A1887F] font-sans">
                Beli Produk di:
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tombol Shopee */}
                {product.marketplaceLinks?.shopee && (
                  <a 
                    href={product.marketplaceLinks.shopee} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 bg-[#EE4D2D] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#d73211] transition-all shadow-lg group"
                  >
                    Shopee <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {/* Tombol Tokopedia */}
                {product.marketplaceLinks?.tokopedia && (
                  <a 
                    href={product.marketplaceLinks.tokopedia} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 bg-[#42B549] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#36943c] transition-all shadow-lg group"
                  >
                    Tokopedia <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {/* Tombol Lazada */}
                {product.marketplaceLinks?.lazada && (
                  <a 
                    href={product.marketplaceLinks.lazada} 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between px-6 py-4 bg-[#0F146D] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#080b4d] transition-all shadow-lg group"
                  >
                    Lazada <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {/* Fallback ke WhatsApp jika tidak ada link ecommerce sama sekali */}
                {!hasMarketplace && (
                  <a 
                    href={`https://wa.me/628123456789?text=Halo Mochint, saya tertarik dengan produk ${product.name}`}
                    target="_blank" rel="noopener noreferrer"
                    className="col-span-full flex items-center justify-center gap-4 px-10 py-5 bg-[#5D4037] text-white rounded-[20px] font-display font-bold text-sm uppercase tracking-widest hover:bg-[#3E2723] transition-all shadow-xl group"
                  >
                    <ShoppingBag size={20} /> Pesan via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Gambar Produk */}
          <div className="flex-1 bg-[#FDFBF7] flex items-center justify-center p-12 order-1 md:order-2 border-b md:border-b-0 md:border-l border-gray-100 relative overflow-hidden">
            <div className="absolute w-80 h-80 bg-[#8D6E63]/5 rounded-full blur-3xl"></div>
            <div className="relative group z-10">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-[350px] md:max-h-[480px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;