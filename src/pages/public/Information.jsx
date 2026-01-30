import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Play, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Information = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/articles';

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(API_URL);
        // Filter hanya yang Published dan urutkan berdasarkan updated_at/created_at terbaru
        const publishedData = response.data
          .filter(a => a.status === 'Published')
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
        
        setArticles(publishedData);
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Membagi data secara dinamis
  const headline = articles[0];
  const latestArticles = articles.slice(1); 
  const popularNews = articles.slice(0, 6);

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-bold text-[#8D6E63]">
      Memuat Jurnal Kecantikan...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-[#3E2723]">
      <div className="container mx-auto px-6 md:px-20 pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-12 font-sans text-[#8D6E63]">
          <button onClick={() => navigate('/')} className="hover:text-[#3E2723] transition-all">
            <Home size={16} />
          </button>
          <span className="opacity-30">/</span>
          <span className="text-[#3E2723]">Informasi</span>
        </nav>

        {/* Header Title */}
        <h1 className="text-4xl md:text-7xl font-display font-bold text-center mb-20 leading-[1.1] tracking-tighter">
          The Ultimate Guide <br /> 
          <span className="text-[#8D6E63]">Mochint Beauty Care</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* KOLOM KIRI & TENGAH: Content Utama */}
          <div className="lg:col-span-2 space-y-20">
            
            {/* Headline Card */}
            {headline && (
              <div 
                onClick={() => navigate(`/information/${headline._id || headline.id}`)}
                className="relative group cursor-pointer overflow-hidden rounded-[60px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] h-[550px]"
              >
                <img 
                  src={headline.image} 
                  alt={headline.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 p-10 md:p-14 space-y-5">
                  <span className="px-5 py-1.5 bg-[#8D6E63] text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg font-sans">
                    Berita Utama
                  </span>
                  <h2 className="text-white text-3xl md:text-5xl font-display font-bold leading-tight tracking-tight">
                    {headline.title}
                  </h2>
                  <p className="text-gray-200 text-base font-sans line-clamp-2 max-w-2xl opacity-90 leading-relaxed">
                    {headline.content}
                  </p>
                </div>
              </div>
            )}

            {/* SEKSI ARTIKEL TERBARU */}
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-[#8D6E63] rounded-full"></div>
                <h2 className="text-3xl font-display font-bold text-[#3E2723] tracking-tight">Artikel Terbaru</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {latestArticles.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    onClick={() => navigate(`/information/${item._id || item.id}`)}
                    className="space-y-6 group cursor-pointer"
                  >
                    <div className="aspect-[16/10] rounded-[45px] overflow-hidden shadow-md">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    </div>
                    <div className="space-y-4 px-2">
                      <span className="text-[10px] font-black text-[#8D6E63] uppercase tracking-widest font-sans">
                        {item.category}
                      </span>
                      <h3 className="font-display font-bold text-2xl leading-tight group-hover:text-[#8D6E63] transition-colors tracking-tight text-[#3E2723]">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold font-sans uppercase tracking-widest">
                        Mochint Guide • {new Date(item.updated_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Sidebar & Promo */}
          <div className="space-y-16">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-[#3E2723] rounded-full"></div>
              <h2 className="text-2xl font-display font-bold text-[#3E2723] tracking-tight">Terpopuler</h2>
            </div>

            <div className="space-y-12">
              {popularNews.map((news, index) => (
                <div 
                  key={news._id || news.id} 
                  onClick={() => navigate(`/information/${news._id || news.id}`)}
                  className="flex gap-8 items-start group cursor-pointer"
                >
                  <span className="text-5xl font-display font-black text-[#F2E8E5] group-hover:text-[#8D6E63] transition-colors leading-none">
                    {index + 1}
                  </span>
                  <div className="space-y-3">
                    {index === 0 && (
                       <div className="flex items-center gap-2 text-[9px] font-black text-[#8D6E63] mb-2 uppercase tracking-[0.2em] font-sans">
                         <Play size={10} fill="currentColor" /> Sedang Tren
                       </div>
                    )}
                    <h4 className="font-display font-bold text-base leading-snug group-hover:text-[#8D6E63] transition-colors text-[#3E2723] tracking-tight">
                      {news.title}
                    </h4>
                    <p className="text-[10px] text-[#A1887F] font-black uppercase tracking-[0.2em] font-sans">Mochint Care</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Iklan/Promo (Ganti Newsletter) */}
            <div className="bg-[#5D4037] p-10 rounded-[45px] text-white space-y-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#8D6E63] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D7CCC8]">Exclusive Offer</p>
              <h4 className="text-2xl font-display font-bold leading-tight tracking-tight">
                Dapatkan Diskon 30% untuk Reseller!
              </h4>
              <button 
                onClick={() => navigate('/promo')}
                className="w-full py-4 bg-[#8D6E63] text-white rounded-2xl font-display font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-[#5D4037] transition-all shadow-lg active:scale-95"
              >
                Cek Promo
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;