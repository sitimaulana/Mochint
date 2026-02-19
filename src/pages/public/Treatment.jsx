import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ChevronRight, ArrowRight, Filter, X, Menu, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

// Import komponen detailnya
import TreatmentDetail from './TreatmentDetail'; 

const Treatment = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk mobile filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- LOGIKA UNTUK MODAL ---
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API URL
  const API_URL = 'http://localhost:5000/api/treatments';

  const handleShowDetail = (treatment) => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };

  // --- FETCH DATA DARI DATABASE ---
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const data = response.data.data;
        console.log('✅ Treatments loaded:', data.length);
        setTreatments(data);
      } catch (err) {
        console.error("❌ Error fetching treatments from database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatments();
  }, []);

  // ✨ Ambil kategori unik
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(treatments.map(t => t.category))];
    return ['All', ...uniqueCategories.sort()];
  }, [treatments]);

  // ✨ Filter data
  const filteredTreatments = useMemo(() => {
    let filtered = treatments;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [treatments, selectedCategory, searchQuery]);

  // ✨ Reset filter
  const handleResetFilter = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setIsFilterOpen(false);
  };

  // ✨ Format Rupiah
  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return 'Rp ' + number.toLocaleString('id-ID', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8D6E63] border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-[#8D6E63]">Mempersiapkan Layanan Terbaik...</p>
        </div>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-sans p-4">
        <div className="text-center">
          <p className="text-[#8D6E63] font-bold text-lg mb-2">Data Treatment Tidak Tersedia</p>
          <p className="text-gray-400 text-sm">Pastikan server API berjalan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8D6E63] mb-8 sm:mb-12">
          <button onClick={() => navigate('/')} className="hover:opacity-70 transition-all">
            <Home size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <span className="text-gray-300">/</span>
          <span>Perawatan</span>
        </nav>

        {/* ✨ HEADER dengan Info & Reset Button */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-2 tracking-tight text-[#3E2723]">
                Layanan Treatment
              </h2>
              <p className="text-xs sm:text-sm font-sans text-[#8D6E63] font-bold uppercase tracking-widest">
                {filteredTreatments.length} dari {treatments.length} treatment
              </p>
            </div>

            {/* Reset Filter Button - Desktop */}
            {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
              <button
                onClick={handleResetFilter}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8D6E63] text-[#8D6E63] rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#8D6E63] hover:text-white transition-all"
              >
                <X size={16} />
                Reset Filter
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8D6E63] text-white rounded-2xl font-bold text-sm shadow-lg"
          >
            <SlidersHorizontal size={18} />
            Filter & Pencarian
            {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
              <span className="ml-2 px-2 py-0.5 bg-white text-[#8D6E63] rounded-full text-xs font-bold">
                {selectedCategory !== 'All' && searchQuery ? '2' : '1'}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* SIDEBAR DESKTOP */}
          <div className="hidden lg:block lg:w-1/4 space-y-6">
            {/* Search Box */}
            <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-100 bg-[#FDFBF7] text-sm outline-none focus:border-[#8D6E63] font-sans transition-colors"
                />
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>
              
              {searchQuery.trim() !== '' && (
                <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    Mencari: <span className="font-bold">"{searchQuery}"</span>
                  </p>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <h3 className="text-xl font-display font-bold tracking-tight">Kategori</h3>
                <Filter size={18} className="text-[#8D6E63]" />
              </div>
              
              <div className="space-y-4">
                {categories.map((cat) => {
                  const count = cat === 'All' 
                    ? treatments.length 
                    : treatments.filter(t => t.category === cat).length;

                  return (
                    <label 
                      key={cat} 
                      className="flex items-center justify-between gap-4 cursor-pointer group hover:bg-[#FDFBF7] p-3 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="category"
                            className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-full checked:border-[#8D6E63] transition-all"
                            checked={selectedCategory === cat}
                            onChange={() => setSelectedCategory(cat)}
                          />
                          <div className="absolute w-3 h-3 bg-[#8D6E63] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                        </div>
                        <span className={`text-sm font-bold transition-colors font-sans ${
                          selectedCategory === cat 
                            ? 'text-[#8D6E63]' 
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}>
                          {cat}
                        </span>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedCategory === cat
                          ? 'bg-[#8D6E63] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Active Filter Info */}
            {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <Filter size={14} />
                  Filter Aktif:
                </p>
                <div className="space-y-2">
                  {selectedCategory !== 'All' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">Kategori:</span>
                      <span className="px-2 py-1 bg-white rounded text-xs font-bold text-blue-700">
                        {selectedCategory}
                      </span>
                    </div>
                  )}
                  {searchQuery.trim() !== '' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600">Pencarian:</span>
                      <span className="px-2 py-1 bg-white rounded text-xs font-bold text-blue-700 truncate max-w-[150px]">
                        "{searchQuery}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ✨ MOBILE FILTER DRAWER */}
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
                  {/* Search Box Mobile */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Pencarian
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari treatment..."
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
                      Kategori
                    </label>
                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const count = cat === 'All' 
                          ? treatments.length 
                          : treatments.filter(t => t.category === cat).length;

                        return (
                          <label 
                            key={cat} 
                            className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 cursor-pointer transition-all hover:border-[#8D6E63] active:scale-95"
                            style={{
                              borderColor: selectedCategory === cat ? '#8D6E63' : '',
                              backgroundColor: selectedCategory === cat ? '#FDFBF7' : ''
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="radio"
                                  name="category-mobile"
                                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#8D6E63] transition-all"
                                  checked={selectedCategory === cat}
                                  onChange={() => setSelectedCategory(cat)}
                                />
                                <div className="absolute w-2.5 h-2.5 bg-[#8D6E63] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                              </div>
                              <span className={`text-sm font-bold font-sans ${
                                selectedCategory === cat 
                                  ? 'text-[#8D6E63]' 
                                  : 'text-gray-600'
                              }`}>
                                {cat}
                              </span>
                            </div>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              selectedCategory === cat
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

                  {/* Active Filters Mobile */}
                  {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                      <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <Filter size={14} />
                        Filter Aktif
                      </p>
                      <div className="space-y-2">
                        {selectedCategory !== 'All' && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-blue-600 font-medium">Kategori:</span>
                            <span className="px-2 py-1 bg-white rounded font-bold text-blue-700">
                              {selectedCategory}
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
                    Terapkan Filter ({filteredTreatments.length})
                  </button>
                  {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
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

          {/* ✨ LIST LAYANAN - RESPONSIVE GRID */}
          <div className="w-full lg:w-3/4">
            {/* Mobile Active Filter Info */}
            {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
              <div className="lg:hidden mb-4 bg-blue-50 border-2 border-blue-200 p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Filter size={12} className="text-blue-700" />
                    {selectedCategory !== 'All' && (
                      <span className="px-2 py-1 bg-white rounded font-bold text-blue-700">
                        {selectedCategory}
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

            <div className="space-y-4 sm:space-y-6">
              {filteredTreatments.length > 0 ? (
                filteredTreatments.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[30px] shadow-sm border border-gray-50 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-8 group hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="w-full md:w-40 lg:w-48 h-40 sm:h-48 md:h-40 bg-[#F9F6F2] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                      <img 
                        src={item.image || 'https://via.placeholder.com/400x300?text=Treatment'} 
                        alt={item.name} 
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg sm:text-xl font-display font-bold text-[#3E2723] leading-tight">
                          {item.name}
                        </h3>
                        <span className="inline-block w-fit px-2 sm:px-3 py-1 bg-[#F5F0E8] text-[#8D6E63] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm font-sans text-gray-500 line-clamp-2 italic leading-relaxed">
                        {item.description || 'Treatment berkualitas untuk perawatan terbaik Anda'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        {item.duration && (
                          <div className="px-2 sm:px-3 py-1 bg-gray-50 text-[9px] sm:text-[10px] font-bold text-[#8D6E63] rounded-lg flex items-center gap-1">
                            ⏱️ {item.duration}
                          </div>
                        )}
                        
                        {item.price && (
                          <div className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">
                            {formatRupiah(item.price)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <div className="w-full md:w-auto md:pr-2 lg:pr-4">
                      <button 
                        onClick={() => handleShowDetail(item)}
                        className="w-full md:w-auto font-display flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#8D6E63] text-[#8D6E63] rounded-full font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-[#8D6E63] hover:text-white transition-all group/btn active:scale-95"
                      >
                        Selengkapnya 
                        <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-[30px] border-2 border-dashed border-gray-200">
                  <div className="mb-4">
                    <Search size={40} className="sm:w-12 sm:h-12 mx-auto text-gray-300" />
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-gray-400 mb-2 px-4">
                    Tidak Ada Treatment Ditemukan
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-gray-400 mb-6 px-4">
                    {searchQuery.trim() !== '' 
                      ? `Pencarian "${searchQuery}" tidak ditemukan`
                      : `Tidak ada treatment di kategori ${selectedCategory}`
                    }
                  </p>
                  <button
                    onClick={handleResetFilter}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-[#8D6E63] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#5D4037] transition-all active:scale-95"
                  >
                    Lihat Semua Treatment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RENDER MODAL DETAIL */}
      <TreatmentDetail 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        treatment={selectedTreatment} 
      />
    </div>
  );
};

export default Treatment;