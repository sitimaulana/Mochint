import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Home } from 'lucide-react';

const BookingStep2 = () => {
  const navigate = useNavigate();

  // 1. Data Katalog Treatment
  const allTreatments = [
    { id: 1, name: 'Facial Micro Diamond', category: 'Beauty Treatment', price: '120k', info: 'Pembersihan mendalam dengan microdiamond' },
    { id: 2, name: 'Facial Peeling Ultimate', category: 'Ultimate Treatment', price: '175k', info: 'Whitening / Acne Treatment' },
    { id: 3, name: 'Facial Detox', category: 'Beauty Treatment', price: '135k', info: 'Mengeluarkan racun pada kulit wajah' },
    { id: 4, name: 'Facial Mesotherapy', category: 'Ultimate Treatment', price: '175k', info: 'Nutrisi wajah tanpa jarum' },
    { id: 5, name: 'Mochint Signature', category: 'Special Treatment', price: '250k', info: 'Layanan eksklusif Signature Mochint' },
  ];

  // 2. State Management
  const [selectedCategory, setSelectedCategory] = useState('Beauty Treatment');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState(
    allTreatments.filter(t => t.category === 'Beauty Treatment')
  );

  // 3. Fungsi Apply Filter
  const handleApplyFilter = () => {
    const filtered = allTreatments.filter(t => 
      t.category === selectedCategory && 
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTreatments(filtered);
  };

  // 4. Navigasi ke Step 3
  const handleBookNow = (treatment) => {
    sessionStorage.setItem('selectedTreatment', JSON.stringify(treatment));
    navigate('/member/booking/step-3');
  };

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

          <h3 className="text-[10px] font-black text-[#5D4037] mb-6 uppercase tracking-[0.2em] font-sans">Kategori</h3>
          <div className="space-y-4 mb-8">
            {['Beauty Treatment', 'Special Treatment', 'Ultimate Treatment', 'Promo Treatment'].map((cat) => (
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
                  {cat}
                </span>
              </label>
            ))}
          </div>

          <button 
            onClick={handleApplyFilter}
            className="w-full py-4 bg-[#8D6E63] text-white rounded-2xl font-display font-bold flex items-center justify-center gap-2 hover:bg-[#5D4037] transition-all shadow-lg shadow-[#8D6E63]/20 uppercase text-xs tracking-widest"
          >
            <Plus size={18} /> Apply Filter
          </button>
        </div>

        {/* TREATMENT CATALOG (Kanan) */}
        <div className="w-full lg:w-2/3 text-left">
          <h2 className="text-xl font-display font-bold text-[#2D3436] mb-6 tracking-tight">Daftar Layanan (Katalog)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <h4 className="font-display font-bold text-[#2D3436] mb-1 group-hover:text-[#8D6E63] transition-colors tracking-tight text-lg">{item.name}</h4>
                    <p className="text-[10px] font-sans font-bold text-gray-400 mb-6 uppercase tracking-widest">{item.info}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-xl font-display font-bold text-[#2D3436]">{item.price}</span>
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
                <p className="text-gray-400 italic font-sans">Layanan tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingStep2;