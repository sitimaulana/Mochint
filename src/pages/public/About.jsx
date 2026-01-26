import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const About = () => {
  const navigate = useNavigate();

  const awards = [
    { id: 1, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 2, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 3, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 4, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 5, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-6 md:px-20 pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-sm font-bold text-[#8D6E63] mb-12">
          <button onClick={() => navigate('/')} className="hover:opacity-70 transition-all">
            <Home size={18} />
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-bold">About Us</span>
        </nav>

        {/* Section 1: Story (Sama seperti sebelumnya) */}
        <section className="space-y-8 mb-24">
          <h1 className="text-4xl font-serif font-bold text-[#5D4037]">Story Mochint Beauty Care</h1>
          <div className="relative w-full h-[500px] rounded-[40px] overflow-hidden shadow-xl">
            <img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80" alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-12">
              <h2 className="text-white text-5xl font-bold leading-tight max-w-md">Mochint Beauty Care</h2>
            </div>
          </div>
          <p className="text-gray-500 leading-relaxed text-justify">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
        </section>

        {/* Section 2: Penghargaan dengan Slider Interaktif */}
        <section className="space-y-12">
          <h2 className="text-4xl font-serif font-bold text-[#5D4037]">Penghargaan</h2>

          <div className="relative group px-4">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                nextEl: '.next-award',
                prevEl: '.prev-award',
              }}
              pagination={{
                el: '.custom-pagination',
                clickable: true,
                renderBullet: (index, className) => {
                  return `<span class="${className} custom-dot"></span>`;
                },
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              grabCursor={true}
              className="award-swiper"
            >
              {awards.map((award) => (
                <SwiperSlide key={award.id}>
                  <div className="bg-white rounded-[30px] shadow-sm overflow-hidden border border-gray-50 h-full">
                    <div className="aspect-square">
                      <img src={award.image} alt={award.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                        {award.title}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation & Pagination UI Sesuai Desain */}
            <div className="flex items-center justify-center gap-8 mt-12">
              <button className="prev-award p-2 hover:text-[#8D6E63] transition-colors cursor-pointer">
                <ChevronLeft size={28} />
              </button>
              
              {/* Pagination Container */}
              <div className="custom-pagination flex items-center gap-3"></div>

              <button className="next-award p-2 hover:text-[#8D6E63] transition-colors cursor-pointer">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* CSS Khusus untuk Dots Sesuai Desain image_d84fdd.jpg */}
      <style>{`
        .custom-pagination { width: auto !important; position: static !important; }
        .custom-dot {
          width: 8px !important;
          height: 8px !important;
          background: #E5E7EB !important;
          border-radius: 50% !important;
          opacity: 1 !important;
          transition: all 0.3s ease;
          display: inline-block;
          cursor: pointer;
        }
        .swiper-pagination-bullet-active {
          width: 32px !important;
          border-radius: 10px !important;
          background: #5D4037 !important;
        }
      `}</style>
    </div>
  );
};

export default About;