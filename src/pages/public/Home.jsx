import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Phone, Star, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import API Client
import { fetchHomeData } from '../../api/client'; 

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null); 

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- LOAD DATA (SISTEM DIPERBAIKI) ---
  useEffect(() => {
    const loadData = async () => {
      // 1. Reset state testimoni menjadi kosong dulu agar data benar-benar "fresh"
      setTestimonials([]);
      
      try {
        // 2. fetchHomeData akan mengambil data mock + data localStorage (public_reviews)
        const data = await fetchHomeData();
        
        setProducts(data.products);
        setTestimonials(data.testimonials); 
        
        // Debugging di console browser untuk memastikan data terbaca
        console.log("Testimonials Loaded:", data.testimonials);
      } catch (error) { 
        console.error("Gagal memuat data:", error); 
      } finally { 
        setIsLoading(false); 
      }
    };
    
    loadData();
  }, []); // Menjalankan ulang setiap kali komponen Home masuk ke layar (mount)

  // --- HANDLERS ---
  const handleBookingClick = () => {
    navigate('/member-app', { state: { openLogin: true } }); 
  };

  const handleAboutClick = () => navigate('/about');
  const handleProductMoreClick = () => navigate('/product');
  const handlePromoClick = () => navigate('/promo');

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 350;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin text-[#8D6E63]"><Loader size={48} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-700 bg-white">
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-[#FDFBF7]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-[#5D4037] mb-6 tracking-tight">
            Mochint Beauty Care
          </h1>
          <p className="text-lg md:text-xl text-[#8D6E63] mb-10 max-w-2xl mx-auto font-medium font-sans">
            Your premium destination for elegant beauty treatments and radiant skincare
          </p>
          <button onClick={handleBookingClick} className="font-display inline-flex items-center px-10 py-4 bg-[#8D6E63] text-white text-lg font-bold rounded-full hover:bg-[#6D4C41] transition-all shadow-lg transform hover:-translate-y-1">
            Booking Now <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
               <div className="absolute top-4 left-4 w-full h-full border-2 border-[#8D6E63] rounded-[30px] -z-10"></div>
               <div className="bg-gray-100 rounded-[30px] h-96 flex items-center justify-center border border-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80" alt="Banner" className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="font-display inline-block px-3 py-1 bg-[#FDFBF7] text-[#8D6E63] text-xs font-bold tracking-widest uppercase mb-4 rounded-md">Premium Clinic</div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[#3E2723] mb-6 tracking-tight leading-tight">Beauty Beyond <br/> Limits</h2>
              <p className="font-sans text-gray-500 mb-8 leading-relaxed text-lg font-normal">Welcome to Mochint Beauty Care. We combine advanced technology with 100% premium ingredients provided by certified professionals.</p>
              <button onClick={handleAboutClick} className="font-display px-8 py-3 border-2 border-[#8D6E63] text-[#8D6E63] font-bold rounded-full hover:bg-[#8D6E63] hover:text-white transition-all">About Us</button>
            </div>
        </div>
      </section>

      {/* Rekomendasi Produk */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-[#5D4037] tracking-tight">Rekomendasi Produk</h2>
            <p className="font-sans text-[#8D6E63] text-sm mt-3 tracking-widest uppercase font-bold">Terbaik Untuk Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer flex flex-col items-center">
                <div className="w-full aspect-[4/5] bg-white mb-6 overflow-hidden rounded-2xl shadow-sm relative" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" />
                  <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <span className="bg-white/90 text-[#5D4037] px-4 py-2 rounded-full text-xs font-bold font-sans">Rp {product.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <h3 className="text-base font-display font-bold text-[#3E2723] group-hover:text-[#8D6E63] transition-colors">{product.name}</h3>
                <p className="text-[10px] font-sans text-gray-400 mt-1 uppercase tracking-widest font-bold">{product.category}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <button onClick={handleProductMoreClick} className="font-display inline-flex items-center text-[#8D6E63] font-bold hover:text-[#5D4037] transition-colors border-b-2 border-[#8D6E63] pb-1">
              Lihat Selengkapnya <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20">
        <div className="container mx-auto px-6">
            <div className="relative rounded-[30px] overflow-hidden bg-[#5D4037] text-white py-16 px-10 md:px-20 flex flex-col md:flex-row items-center justify-between shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8D6E63] rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight tracking-tight">30% Discount <br/> <span className="text-[#D7CCC8]">Selected Products</span></h2>
                    <p className="font-sans text-[#D7CCC8]/80 text-lg mb-8 font-normal">Penawaran terbatas bulan ini. Dapatkan kulit sehat impianmu dengan harga lebih hemat.</p>
                    <button onClick={handlePromoClick} className="font-display px-8 py-3 bg-white text-[#5D4037] font-bold rounded-full hover:bg-gray-100 transition shadow-lg">Cek Promo</button>
                </div>
            </div>
        </div>
      </section>

      {/* Testimonials Section - DINAMIS */}
      <section className="py-20 bg-white overflow-hidden relative text-center">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#3E2723] tracking-tighter">Apa Kata Mereka?</h2>
            <p className="font-sans text-[#8D6E63] mt-2 font-bold uppercase tracking-[0.2em] text-xs">Ribuan pelanggan puas dengan layanan kami</p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white border border-gray-200 p-3 rounded-full shadow-md text-[#5D4037] hover:bg-[#FDFBF7] transition hidden md:block">
              <ChevronLeft size={24} />
            </button>
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 px-4 snap-x snap-mandatory scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {testimonials.map((item) => (
                <div key={item.id} className="min-w-[300px] md:min-w-[350px] bg-[#FDFBF7] p-8 rounded-[40px] border border-gray-100 shadow-sm snap-center flex-shrink-0 text-left transition-all duration-300 hover:shadow-xl">
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(item.rating) ? "currentColor" : "none"} className={i < Math.floor(item.rating) ? "" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="font-sans text-[#4E342E] italic mb-6 leading-relaxed line-clamp-4 font-medium text-base">"{item.comment}"</p>
                  <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                    <div className="w-10 h-10 bg-[#3E2723] rounded-2xl flex items-center justify-center text-white font-bold shrink-0 font-display">{item.name?.charAt(0).toUpperCase() || "M"}</div>
                    <div>
                      <h4 className="font-display font-bold text-[#3E2723] text-sm">{item.name}</h4>
                      <p className="font-sans text-[10px] text-[#A1887F] font-black uppercase tracking-widest">{item.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white border border-gray-200 p-3 rounded-full shadow-md text-[#5D4037] hover:bg-[#FDFBF7] transition hidden md:block">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#3E2723] text-white rounded-t-[50px] mt-10">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div className="bg-white/5 p-4 rounded-3xl">
                    <div className="w-full h-64 bg-gray-300 rounded-2xl overflow-hidden relative">
                         <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-60" alt="Map" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-white text-[#3E2723] px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 font-display uppercase tracking-widest text-xs"><MapPin size={18}/> Lokasi Kami</span>
                         </div>
                    </div>
                </div>
                <div className="space-y-8 flex flex-col justify-center">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-display font-bold tracking-tight">Kunjungi Kami</h2>
                      <p className="font-sans text-[#D7CCC8] font-medium opacity-80">Jl. Beauty Care No. 123, Jakarta Selatan</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="bg-[#8D6E63] p-4 rounded-2xl shadow-lg"><Phone size={24}/></div>
                      <div className="font-sans">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-[#D7CCC8]">WhatsApp Hotline</h4>
                        <p className="text-lg font-display font-bold">(021) 1234-5678</p>
                      </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/5 mt-16 pt-8 text-center text-[#A1887F] text-xs font-sans font-black uppercase tracking-[0.3em]">&copy; 2026 Mochint Beauty Care Protocol.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;