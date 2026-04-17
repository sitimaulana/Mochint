import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Play, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Information = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = '/api/articles/user';

  // Fungsi untuk memotong text ke N kalimat pertama
  const truncateToSentences = (text, numSentences = 2) => {
    if (!text) return '';
    // Split by sentence-ending punctuation (.!?)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const truncated = sentences.slice(0, numSentences).join('').trim();
    return truncated || text.substring(0, 150) + '...';
  };

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
    <div className="min-h-screen bg-[#FDFBF7] pb-16 sm:pb-20 md:pb-24 font-sans text-[#3E2723]">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-6 sm:pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-8 sm:mb-10 md:mb-12 font-sans text-[#8D6E63]">
          <button onClick={() => navigate('/')} className="hover:text-[#3E2723] transition-all">
            <Home size={14} className="sm:w-4 sm:h-4" />
          </button>
          <span className="opacity-30">/</span>
          <span className="text-[#3E2723]">Informasi</span>
        </nav>

        {/* Header Title */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-bold text-center mb-10 sm:mb-14 md:mb-20 leading-[1.1] tracking-tighter px-2">
          The Ultimate Guide <br /> 
          <span className="text-[#8D6E63]">Mochint Beauty Care</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          
          {/* KOLOM KIRI & TENGAH: Content Utama */}
          <div className="lg:col-span-2 space-y-12 sm:space-y-16 md:space-y-20">
            
            {/* Headline Card */}
            {headline && (
              <div 
                onClick={() => navigate(`/information/${headline._id || headline.id}`)}
                className="relative group cursor-pointer overflow-hidden rounded-3xl sm:rounded-[45px] md:rounded-[60px] shadow-lg sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] h-[380px] sm:h-[450px] md:h-[550px] active:scale-[0.98] transition-transform"
              >
                <img 
                  src={headline.image} 
                  alt={headline.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 p-6 sm:p-8 md:p-10 lg:p-14 space-y-3 sm:space-y-4 md:space-y-5">
                  <span className="px-3 sm:px-4 md:px-5 py-1 sm:py-1.5 bg-[#8D6E63] text-white text-[8px] sm:text-[9px] font-black rounded-full uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-lg font-sans inline-block">
                    Berita Utama
                  </span>
                  <h2 className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold leading-tight tracking-tight">
                    {headline.title}
                  </h2>
                  <p className="text-gray-200 text-sm sm:text-base font-sans max-w-2xl opacity-90 leading-relaxed hidden sm:block">
                    {truncateToSentences(headline.content, 2)}
                  </p>
                </div>
              </div>
            )}

            {/* SEKSI ARTIKEL TERBARU */}
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-1.5 sm:w-2 h-8 sm:h-10 bg-[#8D6E63] rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#3E2723] tracking-tight">Artikel Terbaru</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                {latestArticles.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    onClick={() => navigate(`/information/${item._id || item.id}`)}
                    className="space-y-4 sm:space-y-5 md:space-y-6 group cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="aspect-[16/10] rounded-2xl sm:rounded-3xl md:rounded-[45px] overflow-hidden shadow-md">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                    </div>
                    <div className="space-y-2.5 sm:space-y-3 md:space-y-4 px-1 sm:px-2">
                      <span className="text-[9px] sm:text-[10px] font-black text-[#8D6E63] uppercase tracking-wider sm:tracking-widest font-sans">
                        {item.category}
                      </span>
                      <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl leading-tight group-hover:text-[#8D6E63] transition-colors tracking-tight text-[#3E2723] line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-bold font-sans uppercase tracking-wider sm:tracking-widest">
                        Mochint Guide â€¢ {new Date(item.updated_at || item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Sidebar & Promo */}
          <div className="space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-1.5 sm:w-2 h-7 sm:h-8 bg-[#3E2723] rounded-full"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-[#3E2723] tracking-tight">Terpopuler</h2>
            </div>

            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {popularNews.map((news, index) => (
                <div 
                  key={news._id || news.id} 
                  onClick={() => navigate(`/information/${news._id || news.id}`)}
                  className="flex gap-4 sm:gap-6 md:gap-8 items-start group cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-[#F2E8E5] group-hover:text-[#8D6E63] transition-colors leading-none shrink-0">
                    {index + 1}
                  </span>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3 min-w-0 flex-1">
                    {index === 0 && (
                       <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] font-black text-[#8D6E63] mb-1 sm:mb-2 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-sans">
                         <Play size={9} className="sm:w-[10px] sm:h-[10px]" fill="currentColor" /> Sedang Tren
                       </div>
                    )}
                    <h4 className="font-display font-bold text-sm sm:text-base leading-snug group-hover:text-[#8D6E63] transition-colors text-[#3E2723] tracking-tight line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-[#A1887F] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] font-sans">Mochint Care</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Iklan/Promo (Ganti Newsletter) */}
            <div className="bg-[#5D4037] p-6 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] md:rounded-[45px] text-white space-y-4 sm:space-y-5 md:space-y-6 relative overflow-hidden shadow-xl sm:shadow-2xl group">
              <div className="absolute -right-8 -top-8 sm:-right-10 sm:-top-10 w-24 h-24 sm:w-32 sm:h-32 bg-[#8D6E63] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#D7CCC8] relative z-10">Exclusive Offer</p>
              <h4 className="text-lg sm:text-xl md:text-2xl font-display font-bold leading-tight tracking-tight relative z-10">
                Dapatkan Diskon 30% untuk Reseller!
              </h4>
              <button 
                onClick={() => navigate('/promo')}
                className="w-full py-3 sm:py-3.5 md:py-4 bg-[#8D6E63] text-white rounded-xl sm:rounded-2xl font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest hover:bg-white hover:text-[#5D4037] transition-all shadow-lg active:scale-95 relative z-10"
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
