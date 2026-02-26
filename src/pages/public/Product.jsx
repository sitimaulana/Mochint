import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowRight, Filter, X, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

// Import komponen detail
import ProductDetail from './ProductDetail';

const Product = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk mobile filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = 'http://localhost:5000/api/products';

  // Ambil unique categories dari data
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['All Products', ...uniqueCategories.sort()];
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setProducts(response.data);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // LOGIKA FILTER OTOMATIS dengan useMemo
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeTab === 'All Products') {
        return matchesSearch;
      }
      
      return product.category === activeTab && matchesSearch;
    });
  }, [products, activeTab, searchQuery]);

  // Reset filter
  const handleResetFilter = () => {
    setActiveTab('All Products');
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  // Format harga
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

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8D6E63] border-t-transparent mx-auto mb-4"></div>
        <p className="font-bold text-[#8D6E63]">Mempersiapkan Produk Kecantikan...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#3E2723]">
      {/* ✨ CONTAINER dengan MARGIN KANAN KIRI */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-8 max-w-[1400px]">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8D6E63] font-sans mb-8 sm:mb-12">
          <button onClick={() => navigate('/')} className="hover:text-[#5D4037] transition-colors">
            <Home size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <span className="text-gray-300">/</span>
          <span>Skincare</span>
        </nav>

        {/* Header & Info */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-2 tracking-tight text-[#3E2723]">
                Produk Skincare
              </h2>
              <p className="text-xs sm:text-sm font-sans text-[#8D6E63] font-bold uppercase tracking-widest">
                {filteredProducts.length} dari {products.length} produk
              </p>
            </div>

            {/* Desktop Reset Button */}
            {(activeTab !== 'All Products' || searchQuery.trim() !== '') && (
              <button
                onClick={handleResetFilter}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8D6E63] text-[#8D6E63] rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#8D6E63] hover:text-white transition-all"
              >
                <X size={16} />
                Reset Filter
              </button>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:block relative max-w-md">
            <input
              type="text"
              placeholder="Cari produk kecantikan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-12 py-3.5 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] shadow-sm font-sans text-sm transition-all"
            />
            <Search className="absolute right-4 top-4 text-[#8D6E63]" size={18} />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8D6E63] text-white rounded-2xl font-bold text-sm shadow-lg mt-4"
          >
            <SlidersHorizontal size={18} />
            Filter & Pencarian
            {(activeTab !== 'All Products' || searchQuery.trim() !== '') && (
              <span className="ml-2 px-2 py-0.5 bg-white text-[#8D6E63] rounded-full text-xs font-bold">
                {(activeTab !== 'All Products' ? 1 : 0) + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:flex border-b border-gray-200 mb-12 overflow-x-auto no-scrollbar bg-white/50 rounded-t-2xl px-2">
          {categories.map((cat) => {
            const count = cat === 'All Products' 
              ? products.length 
              : products.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex-1 min-w-fit py-5 text-sm font-display font-bold transition-all px-6 border-b-4 tracking-tight relative ${
                  activeTab === cat 
                    ? 'text-[#5D4037] border-[#8D6E63]' 
                    : 'text-gray-400 border-transparent hover:text-[#8D6E63]'
                }`}
              >
                {cat}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === cat 
                    ? 'bg-[#8D6E63] text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            ></div>
            
            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-display font-bold text-[#3E2723]">Filter & Pencarian</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Search Mobile */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                    Pencarian
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-[#FDFBF7] text-sm outline-none focus:border-[#8D6E63] font-sans transition-colors"
                    />
                    <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>

                {/* Category Mobile */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Filter size={14} />
                    Kategori Produk
                  </label>
                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const count = cat === 'All Products' 
                        ? products.length 
                        : products.filter(p => p.category === cat).length;

                      return (
                        <label 
                          key={cat} 
                          className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 cursor-pointer transition-all hover:border-[#8D6E63] active:scale-95"
                          style={{
                            borderColor: activeTab === cat ? '#8D6E63' : '',
                            backgroundColor: activeTab === cat ? '#FDFBF7' : ''
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                              <input
                                type="radio"
                                name="category-mobile"
                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#8D6E63] transition-all"
                                checked={activeTab === cat}
                                onChange={() => setActiveTab(cat)}
                              />
                              <div className="absolute w-2.5 h-2.5 bg-[#8D6E63] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                            <span className={`text-sm font-bold font-sans ${
                              activeTab === cat 
                                ? 'text-[#8D6E63]' 
                                : 'text-gray-600'
                            }`}>
                              {cat}
                            </span>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            activeTab === cat
                              ? 'bg-[#8D6E63] text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Active Filters */}
                {(activeTab !== 'All Products' || searchQuery.trim() !== '') && (
                  <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                    <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <Filter size={14} />
                      Filter Aktif
                    </p>
                    <div className="space-y-2">
                      {activeTab !== 'All Products' && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-blue-600 font-medium">Kategori:</span>
                          <span className="px-2 py-1 bg-white rounded font-bold text-blue-700">
                            {activeTab}
                          </span>
                        </div>
                      )}
                      {searchQuery.trim() !== '' && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-blue-600 font-medium">Pencarian:</span>
                          <span className="px-2 py-1 bg-white rounded font-bold text-blue-700 truncate max-w-[150px]">
                            "{searchQuery}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-2">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-[#8D6E63] text-white rounded-xl font-bold text-sm shadow-lg"
                >
                  Terapkan Filter ({filteredProducts.length})
                </button>
                {(activeTab !== 'All Products' || searchQuery.trim() !== '') && (
                  <button
                    onClick={handleResetFilter}
                    className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold text-sm"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Active Filter Info */}
        {(activeTab !== 'All Products' || searchQuery.trim() !== '') && (
          <div className="lg:hidden mb-4 bg-blue-50 border-2 border-blue-200 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Filter size={12} className="text-blue-700" />
                {activeTab !== 'All Products' && (
                  <span className="px-2 py-1 bg-white rounded font-bold text-blue-700">
                    {activeTab}
                  </span>
                )}
                {searchQuery.trim() !== '' && (
                  <span className="px-2 py-1 bg-white rounded font-bold text-blue-700 truncate max-w-[100px]">
                    "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={handleResetFilter}
                className="text-blue-700 font-bold text-xs hover:underline"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Product Grid - RESPONSIVE */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={product._id || product.id} 
                className="bg-white rounded-2xl sm:rounded-[35px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-[0_20px_50px_rgba(141,110,99,0.15)] transition-all duration-500"
              >
                <div className="aspect-[4/5] bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full shadow-sm">
                    <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-[#8D6E63] font-sans">
                      {product.category}
                    </p>
                  </div>
                  {isPromoActive(product) && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500 px-2 sm:px-3 py-1 rounded-full shadow-lg">
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-white font-sans">
                        PROMO {product.discount_percentage}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 lg:p-7">
                  <h3 className="text-[#3E2723] font-display font-bold text-sm sm:text-base mb-4 sm:mb-6 h-10 sm:h-12 leading-tight overflow-hidden tracking-tight line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <button 
                    onClick={() => handleShowDetail(product)}
                    className="w-full flex items-center justify-between bg-white border-2 border-[#8D6E63] text-[#8D6E63] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 hover:bg-[#8D6E63] hover:text-white transition-all duration-300 group/btn shadow-sm active:scale-95"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase opacity-60 font-sans tracking-widest leading-none mb-1">
                        Harga
                      </span>
                      {isPromoActive(product) ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 line-through">
                            Rp {formatPrice(product.price)}
                          </span>
                          <span className="text-xs sm:text-sm font-display font-bold text-red-600 group-hover/btn:text-white">
                            Rp {formatPrice(calculateDiscountedPrice(product.price, product.discount_percentage))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-display font-bold">
                          Rp {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <div className="bg-[#8D6E63] group-hover/btn:bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors">
                      <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px] text-white group-hover/btn:text-[#8D6E63] transition-transform group-hover/btn:translate-x-1" />
                    </div>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 sm:py-20 text-center bg-white rounded-2xl sm:rounded-[30px] border-2 border-dashed border-gray-200">
              <div className="mb-4">
                <Search size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300" />
              </div>
              <p className="font-display text-lg sm:text-xl font-bold text-gray-400 mb-2 px-4">
                Tidak Ada Produk Ditemukan
              </p>
              <p className="font-sans text-xs sm:text-sm text-gray-400 mb-6 px-4">
                {searchQuery.trim() !== '' 
                  ? `Pencarian "${searchQuery}" tidak ditemukan`
                  : `Tidak ada produk di kategori ${activeTab}`
                }
              </p>
              <button
                onClick={handleResetFilter}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#8D6E63] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#5D4037] transition-all active:scale-95"
              >
                Lihat Semua Produk
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductDetail 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default Product;