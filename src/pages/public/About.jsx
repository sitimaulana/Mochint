import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronLeft, ChevronRight } from '/src/components/icons';
import axios from 'axios';
import Preloader from '../../components/common/Preloader';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const About = () => {
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState({
    story: null,
    vision: null,
    awards: null,
    facilities: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const API_URL_PAGE_INFO = '/api/page-info/public';

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL_PAGE_INFO}?page_type=about`);
        const pageInfoData = response.data.data || [];
        
        console.log('About page content loaded:', pageInfoData);
        
        const contentMap = {
          story: pageInfoData.find(item => item.section_key === 'story'),
          vision: pageInfoData.find(item => item.section_key === 'vision'),
          awards: pageInfoData.find(item => item.section_key === 'awards'),
          facilities: pageInfoData.find(item => item.section_key === 'facilities')
        };
        
        setPageContent(contentMap);
      } catch (error) {
        console.error('Error loading page content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // Get awards from database or use default
  const awards = pageContent.awards?.additional_data?.items || [
    { id: 1, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 2, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 3, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 4, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
    { id: 5, title: 'Best Category', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80' },
  ];

  // Get facilities from database
  const facilities = pageContent.facilities?.additional_data?.items || [];

  if (isLoading) {
    return <Preloader type="fullscreen" text="Memuat Informasi Tentang Kami..." bgColor="bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-6 md:px-20 pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-sm font-bold text-[#8D6E63] mb-12">
          <button onClick={() => navigate('/')} className="hover:opacity-70 transition-all">
            <Home size={18} />
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-bold">Tentang Kami</span>
        </nav>


        {/* Section 1: Story (Sama seperti sebelumnya) */}
        <section className="space-y-8 mb-24">
          <h1 className="text-4xl md:text-4xl font-display font-bold text-[#3E2723] tracking-tight">
            {pageContent.story?.title || ''}
          </h1>
          <div className="relative w-full h-[500px] rounded-[40px] overflow-hidden shadow-xl">
            <img 
              src={pageContent.story?.image_url || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80'} 
              alt="Banner" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-12">
              <h2 className="text-white text-5xl font-bold leading-tight max-w-md">
                {pageContent.story?.subtitle || 'Mochint Beauty Care'}
              </h2>
            </div>
          </div>
          <p className="text-gray-500 leading-relaxed text-justify">
            {pageContent.story?.content || 'Selamat datang di Mochint Beauty Care, salon kecantikan yang berlokasi di Pandaan Pasuruan Jawa Timur. Kami hadir sebagai solusi bagi Anda yang ingin merawat kulit dengan teknologi terkini dan bahan premium.'}
          </p>
        </section>



        {/* Section 2: Vision & Mission (Opsional, jika ada data) */}
        {pageContent.vision && (
          <section className="space-y-8 mb-24">
            <h2 className="text-4xl md:text-4xl font-display font-bold text-[#3E2723] tracking-tight">
              {pageContent.vision.title || 'Visi & Misi'}
            </h2>
            {pageContent.vision.additional_data?.visi && (
              <div className="bg-white p-8 rounded-[30px] shadow-sm">
                <h3 className="text-2xl font-bold text-[#5D4037] mb-4">Visi</h3>
                <p className="text-gray-600 leading-relaxed">
                  {pageContent.vision.additional_data.visi}
                </p>
              </div>
            )}
            {pageContent.vision.additional_data?.misi && pageContent.vision.additional_data.misi.length > 0 && (
              <div className="bg-white p-8 rounded-[30px] shadow-sm">
                <h3 className="text-2xl font-bold text-[#5D4037] mb-4">Misi</h3>
                <ul className="space-y-3">
                  {pageContent.vision.additional_data.misi.map((misi, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#8D6E63] font-bold mt-1">•</span>
                      <span className="text-gray-600 leading-relaxed">{misi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Section 3: Penghargaan dengan Slider Interaktif */}
        <section className="space-y-12">
          <h2 className="text-4xl md:text-4xl font-bold text-[#3E2723] tracking-tight">
            {pageContent.awards?.title || 'Pencapaian & Penghargaan'}
          </h2>
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
                      <p className="text-[15px] font-black uppercase tracking-[0.2em] text-#3E2723 text-center">
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

        {/* Section 4: Facilities (Jika ada data dari database) */}
        {pageContent.facilities && facilities.length > 0 && (
          <section className="space-y-12 mt-24">
            <h2 className="text-4xl md:text-4xl font-display font-bold text-[#3E2723] tracking-tight">
              {pageContent.facilities.title || 'Fasilitas'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility, index) => (
                <div key={index} className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                  {facility.image && (
                    <div className="mb-4 h-48 rounded-[20px] overflow-hidden">
                      <img 
                        src={facility.image} 
                        alt={facility.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-[#3E2723] mb-2">{facility.name}</h3>
                  {facility.description && (
                    <p className="text-brown-600 text-sm leading-relaxed">{facility.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
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

