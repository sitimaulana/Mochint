import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Home, Loader2, AlertCircle } from 'lucide-react';
import { treatmentAPI } from '../../../services/api';

const BookingStep2 = () => {
  const navigate = useNavigate();

  // 1. State Management
  const [allTreatments, setAllTreatments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch treatments from backend
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await treatmentAPI.getAll();
        
        if (response.data && response.data.success) {
          setAllTreatments(response.data.data);
        } else {
          throw new Error('Failed to fetch treatments');
        }
      } catch (err) {
        console.error('Error fetching treatments:', err);
        setError(err.message || 'Gagal memuat data treatment');
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  // 3. Filter treatments secara otomatis dengan useMemo
  const filteredTreatments = useMemo(() => {
    let filtered = allTreatments;
    
    // Filter berdasarkan kategori
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Filter berdasarkan pencarian
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [allTreatments, selectedCategory, searchTerm]);

  // 4. Dapatkan unique categories dari data backend
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(allTreatments.map(t => t.category))];
    return ['All', ...uniqueCategories.sort()];
  }, [allTreatments]);

  // 5. Format harga - DIPERBAIKI sesuai dengan Treatment.jsx
  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return 'Rp ' + number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // 6. Navigasi ke Step 3 - DIPERBAIKI
  const handleBookNow = (treatment) => {
    // Pastikan semua data treatment termasuk price tersimpan
    const treatmentData = {
      id: treatment.id || treatment._id,
      name: treatment.name,
      category: treatment.category,
      description: treatment.description,
      duration: treatment.duration,
      price: parseInt(treatment.price) || 0, // Pastikan price tersimpan sebagai number
      image: treatment.image,
      facilities: treatment.facilities || []
    };
    
    sessionStorage.setItem('selectedTreatment', JSON.stringify(treatmentData));
    navigate('/member/booking/step-3');
  };

  // 7. Reset filter
  const handleResetFilter = () => {
    setSelectedCategory('All');
    setSearchTerm('');
  };

  // 8. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8D6E63] mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-sans font-medium">Memuat data treatment...</p>
        </div>
      </div>
    );
  }

  // 9. Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-[30px] shadow-sm border border-red-100 max-w-md">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-display font-bold text-[#5D4037] mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 font-sans mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#8D6E63] text-white text-sm font-display font-bold rounded-xl hover:bg-[#5D4037] transition-all"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      
      {/* RESPONSIVE NAVBAR BOOKING */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')}
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display">
          Treatment
        </span>
      </nav>

      {/* HEADER SECTION */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-[#5D4037] mb-3 tracking-tighter">Pilih Perawatan Anda</h1>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed font-sans font-medium">
          Tampil memukau setiap hari dengan solusi kecantikan modern yang disesuaikan hanya untuk Anda!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTER (Responsive) */}
        <div className="w-full lg:w-1/3 bg-white p-6 md:p-8 rounded-[30px] shadow-sm border border-gray-100 h-fit text-left">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari perawatan..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-[#8D6E63] transition-all text-sm font-sans font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-[#5D4037] uppercase tracking-[0.2em] font-sans">Kategori</h3>
            {(selectedCategory !== 'All' || searchTerm.trim() !== '') && (
              <button 
                onClick={handleResetFilter}
                className="text-[10px] text-gray-400 hover:text-[#8D6E63] font-sans font-bold uppercase tracking-widest transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="radio" 
                    name="category" 
                    className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-full checked:border-[#8D6E63] transition-all" 
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-[#8D6E63] scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className={`text-sm font-bold transition-colors font-sans ${selectedCategory === cat ? 'text-[#8D6E63]' : 'text-gray-400 group-hover:text-[#8D6E63]'}`}>
                  {cat} {cat === 'All' && `(${allTreatments.length})`}
                </span>
              </label>
            ))}
          </div>

          {/* Informasi filter aktif */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-sans text-gray-400 mb-2">Filter Aktif:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== 'All' && (
                <span className="px-3 py-1 bg-[#8D6E63]/10 text-[#8D6E63] text-xs font-sans font-bold rounded-full">
                  Kategori: {selectedCategory}
                </span>
              )}
              {searchTerm.trim() !== '' && (
                <span className="px-3 py-1 bg-[#8D6E63]/10 text-[#8D6E63] text-xs font-sans font-bold rounded-full">
                  Pencarian: "{searchTerm}"
                </span>
              )}
              {selectedCategory === 'All' && searchTerm.trim() === '' && (
                <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-sans rounded-full">
                  Semua perawatan ditampilkan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TREATMENT CATALOG (Kanan) */}
        <div className="w-full lg:w-2/3 text-left">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-[#2D3436] tracking-tight">
              Daftar Layanan {selectedCategory !== 'All' && `- ${selectedCategory}`}
            </h2>
            <span className="text-sm font-sans font-bold text-[#8D6E63] bg-[#8D6E63]/10 px-3 py-1 rounded-full">
              {filteredTreatments.length} perawatan ditemukan
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((item) => (
                <div key={item.id || item._id} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-bold text-[#2D3436] group-hover:text-[#8D6E63] transition-colors tracking-tight text-lg">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-gray-600 mb-2">{item.description || 'Perawatan berkualitas untuk kecantikan Anda'}</p>
                    {item.duration && (
                      <p className="text-xs font-sans text-gray-400 mb-4">⏱ Durasi: {item.duration}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-xl font-display font-bold text-[#2D3436]">{formatRupiah(item.price)}</span>
                    <button 
                      onClick={() => handleBookNow(item)}
                      className="px-6 py-2 bg-[#8D6E63] text-white text-[10px] font-display font-bold rounded-xl hover:bg-[#5D4037] transition-all uppercase tracking-[0.2em] shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[30px] border border-dashed border-gray-200">
                <p className="text-gray-400 italic font-sans mb-4">Layanan tidak ditemukan dengan filter saat ini.</p>
                <button 
                  onClick={handleResetFilter}
                  className="px-6 py-2 bg-gray-100 text-gray-600 text-sm font-sans font-bold rounded-lg hover:bg-gray-200 transition-all"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingStep2;