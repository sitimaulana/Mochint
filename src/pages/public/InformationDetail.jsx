import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Calendar, User, Share2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const InformationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/articles';

  // Helper untuk format tanggal agar aman dari "Invalid Date"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Januari 2026" 
      : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // 1. Fetch data artikel spesifik
        const response = await axios.get(`${API_URL}/${id}`);
        setArticle(response.data);

        // 2. Fetch data artikel lain untuk sidebar (limit 3)
        const allResponse = await axios.get(API_URL);
        const related = allResponse.data
          .filter(item => (item._id || item.id).toString() !== id.toString() && item.status === 'Published')
          .sort(() => 0.5 - Math.random()) // Acak sedikit agar variatif
          .slice(0, 3);
        setRelatedArticles(related);

        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Error fetching article detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-bold text-[#8D6E63]">Membuka Jurnal...</div>;

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans">
        <h2 className="text-2xl font-display font-bold text-[#3E2723] mb-4 tracking-tight">Artikel Tidak Ditemukan</h2>
        <button onClick={() => navigate('/information')} className="text-[#8D6E63] font-bold flex items-center gap-2 hover:text-[#5D4037] transition-colors">
          <ArrowLeft size={18} /> Kembali ke Informasi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-[#3E2723]">
      {/* Hero Section */}
      <div className="relative w-full h-[450px] md:h-[650px]">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/20 to-black/30"></div>
        <button onClick={() => navigate('/information')} className="absolute top-8 left-8 p-3.5 bg-white/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#8D6E63] hover:text-white transition-all text-[#5D4037] group">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="container mx-auto px-6 md:px-20 -mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* KOLOM UTAMA */}
          <div className="lg:col-span-2 bg-white rounded-[50px] p-8 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8D6E63] mb-10 font-sans">
              <Home size={14} className="cursor-pointer hover:text-[#5D4037]" onClick={() => navigate('/')} />
              <ChevronRight size={12} className="opacity-30" />
              <span className="cursor-pointer hover:text-[#5D4037]" onClick={() => navigate('/information')}>Informasi</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-[#A1887F] truncate max-w-[200px]">{article.title}</span>
            </nav>

            <div className="space-y-8 mb-12">
              <span className="inline-block px-5 py-1.5 bg-[#8D6E63] text-white text-[10px] font-black rounded-full uppercase tracking-[0.15em] shadow-sm font-sans">
                {article.category || 'Beauty Guide'}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-[#3E2723] leading-[1.15] tracking-tight">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-gray-100 text-[#8D6E63] text-[13px] font-semibold font-sans">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F9F6F2] flex items-center justify-center text-[#8D6E63]"><User size={16} /></div>
                  <span>{article.author || 'Admin Mochint'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="opacity-60" />
                  {/* Perbaikan Tanggal menggunakan database updated_at/created_at */}
                  <span>{formatDate(article.updated_at || article.created_at)}</span>
                </div>
                <button className="ml-auto flex items-center gap-2 text-[#3E2723] hover:text-[#8D6E63] transition-colors group">
                  <Share2 size={18} /> <span className="font-bold">Bagikan</span>
                </button>
              </div>
            </div>

            <article className="prose prose-brown max-w-none text-[#4E342E] leading-[1.8] space-y-8 text-justify font-sans">
              <div className="whitespace-pre-wrap text-lg opacity-90">
                {article.content}
              </div>
            </article>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[45px] shadow-lg border border-gray-50">
              <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-4 text-[#3E2723] tracking-tight">
                <span className="w-2.5 h-10 bg-[#8D6E63] rounded-full shadow-sm"></span>Terkait
              </h3>
              <div className="space-y-10">
                {relatedArticles.map((item) => (
                  <div key={item._id || item.id} onClick={() => navigate(`/information/${item._id || item.id}`)} className="group cursor-pointer space-y-4">
                    <div className="aspect-[16/10] rounded-[25px] overflow-hidden shadow-md">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <h4 className="font-display font-bold text-base leading-tight text-[#3E2723] group-hover:text-[#8D6E63] transition-colors line-clamp-2 tracking-tight">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Iklan/Promo */}
            <div className="bg-[#5D4037] p-10 rounded-[45px] text-white space-y-6 relative overflow-hidden shadow-2xl group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#8D6E63] rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D7CCC8]">Exclusive Offer</p>
              <h4 className="text-2xl font-display font-bold leading-tight tracking-tight">Dapatkan Diskon 30% untuk Reseller!</h4>
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
      
      <div className="container mx-auto px-6 mt-20 text-center opacity-30 text-xs font-bold uppercase tracking-widest">
        Mochint Beauty Journal &copy; 2026
      </div>
    </div>
  );
};

export default InformationDetail;