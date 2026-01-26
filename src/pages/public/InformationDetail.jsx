import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ChevronRight, Calendar, User, Share2, ArrowLeft } from 'lucide-react';
import { mockInformation } from '../../api/mockData';

const InformationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mencari data artikel berdasarkan ID dari URL
  const article = mockInformation.find(item => item.id === parseInt(id));

  // Scroll ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] font-sans">
        <h2 className="text-2xl font-display font-bold text-[#3E2723] mb-4 tracking-tight">Artikel Tidak Ditemukan</h2>
        <button onClick={() => navigate('/informasi')} className="text-[#8D6E63] font-bold flex items-center gap-2 hover:text-[#5D4037] transition-colors">
          <ArrowLeft size={18} /> Kembali ke Informasi
        </button>
      </div>
    );
  }

  // Data rekomendasi artikel lain (Sidebar)
  const relatedArticles = mockInformation.filter(item => item.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-[#3E2723]">
      {/* Header Image / Hero Section */}
      <div className="relative w-full h-[450px] md:h-[650px]">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/20 to-black/30"></div>
        
        {/* Tombol Kembali Floating */}
        <button 
          onClick={() => navigate('/informasi')}
          className="absolute top-8 left-8 p-3.5 bg-white/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#8D6E63] hover:text-white transition-all text-[#5D4037] group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="container mx-auto px-6 md:px-20 -mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* KOLOM UTAMA: Konten Artikel */}
          <div className="lg:col-span-2 bg-white rounded-[50px] p-8 md:p-20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
            {/* Breadcrumbs - Inter */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8D6E63] mb-10 font-sans">
              <Home size={14} className="cursor-pointer hover:text-[#5D4037]" onClick={() => navigate('/')} />
              <ChevronRight size={12} className="opacity-30" />
              <span className="cursor-pointer hover:text-[#5D4037]" onClick={() => navigate('/informasi')}>Informasi</span>
              <ChevronRight size={12} className="opacity-30" />
              <span className="text-[#A1887F] truncate max-w-[200px]">{article.title}</span>
            </nav>

            <div className="space-y-8 mb-12">
              <span className="inline-block px-5 py-1.5 bg-[#8D6E63] text-white text-[10px] font-black rounded-full uppercase tracking-[0.15em] shadow-sm font-sans">
                {article.category || 'Beauty Guide'}
              </span>
              {/* Judul Artikel - Poppins */}
              <h1 className="text-4xl md:text-6xl font-display font-bold text-[#3E2723] leading-[1.15] tracking-tight">
                {article.title}
              </h1>
              
              {/* Meta Data - Inter */}
              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-gray-100 text-[#8D6E63] text-[13px] font-semibold font-sans">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#F9F6F2] flex items-center justify-center text-[#8D6E63]">
                    <User size={16} />
                  </div>
                  <span>Admin Mochint</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="opacity-60" />
                  <span>{article.date || 'Januari 2026'}</span>
                </div>
                <button className="ml-auto flex items-center gap-2 text-[#3E2723] hover:text-[#8D6E63] transition-colors group">
                  <Share2 size={18} /> <span className="font-bold">Bagikan</span>
                </button>
              </div>
            </div>

            {/* Isi Artikel - Inter */}
            <article className="prose prose-brown max-w-none text-[#4E342E] leading-[1.8] space-y-8 text-justify font-sans">
              <p className="text-xl font-bold text-[#3E2723] leading-relaxed border-l-4 border-[#8D6E63] pl-6 py-1">
                {article.description}
              </p>
              
              <p className="text-lg opacity-90">
                Menjaga kesehatan kulit bukan sekadar menggunakan produk skincare di rumah, namun juga memerlukan penanganan profesional secara berkala. Di Mochint Beauty Care, kami memahami bahwa setiap jenis kulit memiliki kebutuhan unik yang tidak bisa disamaratakan.
              </p>

              {/* Subheading - Poppins */}
              <h3 className="text-2xl md:text-3xl font-display font-bold text-[#3E2723] pt-6 tracking-tight">
                Kenapa Harus Rutin Treatment?
              </h3>
              
              <p className="text-lg opacity-90">
                Proses regenerasi kulit secara alami terjadi setiap 28 hari. Namun, seiring bertambahnya usia dan paparan polusi yang tinggi, proses ini bisa melambat. Treatment seperti Facial Micro Diamond atau Detox Signature membantu mengangkat tumpukan sel kulit mati yang tidak bisa hilang hanya dengan sabun cuci muka biasa.
              </p>

              <div className="bg-[#FDFBF7] p-10 rounded-[30px] italic border-2 border-[#8D6E63]/10 text-xl font-medium text-[#5D4037] relative overflow-hidden">
                <span className="absolute -top-4 -left-2 text-8xl text-[#8D6E63]/10 font-serif leading-none">“</span>
                "Kesehatan kulit adalah investasi jangka panjang. Apa yang Anda lakukan hari ini akan terpancar di masa depan."
              </div>

              <p className="text-lg opacity-90">
                Oleh karena itu, sangat disarankan untuk melakukan konsultasi terlebih dahulu sebelum memilih layanan agar hasil yang didapatkan maksimal dan sesuai dengan kondisi skin barrier Anda saat ini.
              </p>
            </article>
          </div>

          {/* SIDEBAR: Artikel Terkait */}
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[45px] shadow-lg border border-gray-50">
              <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-4 text-[#3E2723] tracking-tight">
                <span className="w-2.5 h-10 bg-[#8D6E63] rounded-full shadow-sm"></span>
                Terkait
              </h3>
              
              <div className="space-y-10">
                {relatedArticles.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/informasi/${item.id}`)}
                    className="group cursor-pointer space-y-4"
                  >
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

            {/* Banner Iklan/Promo - Poppins/Inter */}
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
      
      {/* Footer minimalis pemisah halaman detail */}
      <div className="container mx-auto px-6 mt-20 text-center opacity-30 text-xs font-bold uppercase tracking-widest">
        Mochint Beauty Journal &copy; 2026
      </div>
    </div>
  );
};

export default InformationDetail;