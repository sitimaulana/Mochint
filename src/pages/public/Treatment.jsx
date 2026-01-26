import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ChevronRight, ArrowRight } from 'lucide-react';
import { mockTreatments } from '../../api/mockData';
// Import komponen detailnya
import TreatmentDetail from './TreatmentDetail'; 

const Treatment = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Beauty Treatment');
  const [searchQuery, setSearchQuery] = useState('');

  // --- LOGIKA UNTUK MODAL ---
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetail = (treatment) => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };
  // ---------------------------

  const categories = ['Beauty Treatment', 'Special Treatment', 'Ultimate Treatment', 'Promo Treatment'];

  const filteredTreatments = mockTreatments.filter(item => 
    item.category === selectedCategory &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-6 pt-8">
        
        {/* Breadcrumbs - Menggunakan font-sans (Inter) agar terlihat clean */}
        <nav className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#8D6E63] mb-12">
          <button onClick={() => navigate('/')} className="hover:opacity-70 transition-all">
            <Home size={18} />
          </button>
          <span className="text-gray-300">/</span>
          <span>Treatment</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR KATEGORI */}
          <div className="lg:w-1/4 space-y-8">
            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="Search treatment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-100 bg-[#FDFBF7] text-sm outline-none focus:border-[#8D6E63] font-sans"
                />
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>

              {/* Judul Sidebar menggunakan Poppins */}
              <h3 className="text-xl font-display font-bold mb-6 border-b border-gray-50 pb-4 tracking-tight">Kategori</h3>
              
              <div className="space-y-4">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-4 cursor-pointer group">
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
                    {/* Label kategori menggunakan Inter Bold */}
                    <span className={`text-sm font-bold transition-colors font-sans ${selectedCategory === cat ? 'text-[#8D6E63]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* LIST LAYANAN */}
          <div className="lg:w-3/4 space-y-6">
            {/* Judul Utama menggunakan Poppins */}
            <h2 className="text-3xl font-display font-bold mb-8 tracking-tight">Layanan Treatment</h2>
            
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-8 group hover:shadow-md transition-all">
                  <div className="w-full md:w-48 h-40 bg-[#F9F6F2] rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <div className="flex-1 space-y-2 text-center md:text-left">
                    {/* Nama Treatment menggunakan Poppins */}
                    <h3 className="text-xl font-display font-bold text-[#3E2723]">{item.name}</h3>
                    {/* Deskripsi menggunakan Inter Italic */}
                    <p className="text-sm font-sans text-gray-500 line-clamp-2 italic leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="md:pr-4">
                    <button 
                      onClick={() => handleShowDetail(item)}
                      className="font-display flex items-center gap-3 px-6 py-3 border-2 border-[#8D6E63] text-[#8D6E63] rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#8D6E63] hover:text-white transition-all group/btn"
                    >
                      Selengkapnya <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[30px] border border-dashed border-gray-200">
                <p className="font-sans text-gray-400">Tidak ada treatment ditemukan.</p>
              </div>
            )}
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