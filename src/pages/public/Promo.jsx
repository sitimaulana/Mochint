import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageCircle, ChevronRight, CheckCircle2, Percent } from '/src/components/icons';
import axios from 'axios';
import Preloader from '../../components/common/Preloader';

const Promo = () => {
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL_PAGE_INFO = '/api/page-info/public';

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL_PAGE_INFO}?page_type=promo`);
        const pageInfoData = response.data.data || [];
        
        // Get main promo content
        const promoContent = pageInfoData.find(item => item.section_key === 'main_promo');
        setPageContent(promoContent);
      } catch (error) {
        console.error('Error loading page content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // Extract data from page content
  const title = pageContent?.title || 'Diskon Reseller';
  const subtitle = pageContent?.subtitle || '30% discount for selected products';
  const content = pageContent?.content || 'Pelembab Moisturizer BPOM paling ampuh dan Halal MUI...';
  const imageUrl = pageContent?.image_url || 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80';
  const benefits = pageContent?.additional_data?.benefits || ['Facial Signature', 'Premium Masker', 'Skin Analysis', 'Hydrating Treatment', 'Aftercare Consultation'];
  const discountPercentage = pageContent?.additional_data?.discount_percentage || '30';
  const whatsappNumber = pageContent?.additional_data?.whatsapp_number || '6281234567890';
  const promoLabel = pageContent?.additional_data?.promo_label || 'Limited Offer';

  const handleOrderNow = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Halo%20Mochint%2C%20saya%20tertarik%20dengan%20Promo%20${encodeURIComponent(title)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return <Preloader type="fullscreen" text="Mempersiapkan Penawaran Eksklusif..." bgColor="bg-[#FDFBF7]" />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16 sm:pb-20 md:pb-24 font-sans text-[#3E2723]">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-6 sm:pt-8">
        
        {/* Breadcrumbs - Inter */}
        <nav className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#8D6E63] mb-8 sm:mb-10 md:mb-12 font-sans">
          <button onClick={() => navigate('/')} className="hover:text-[#5D4037] transition-all">
            <Home size={14} className="sm:w-4 sm:h-4" />
          </button>
          <span className="opacity-30">/</span>
          <span className="text-[#3E2723]">Promo Exclusive</span>
        </nav>

        {/* Title Section - Poppins */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 mt-2 sm:mt-0">
          <div className="bg-[#8D6E63] p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-white shadow-lg shrink-0">
            <Percent size={20} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-[#3E2723] tracking-tight leading-tight">
            {title}
          </h1>
        </div>

        {/* Banner Section */}
        <div className="relative w-full h-[280px] sm:h-[350px] md:h-[500px] lg:h-[600px] rounded-3xl sm:rounded-[40px] md:rounded-[50px] overflow-hidden shadow-lg sm:shadow-[0_20px_50px_-15px_rgba(141,110,99,0.35)] md:shadow-[0_30px_60px_-15px_rgba(141,110,99,0.4)] mb-10 sm:mb-12 md:mb-16 group">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          {/* Overlay Text - Poppins */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-24">
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              <span className="bg-[#8D6E63] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider sm:tracking-widest inline-block shadow-lg">{promoLabel}</span>
              <h2 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-bold leading-[1.1] max-w-xl drop-shadow-2xl tracking-tighter">
                {subtitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Description Section - Inter */}
        <section className="max-w-5xl mx-auto space-y-10 sm:space-y-12 md:space-y-16 px-2 sm:px-4 md:px-0">
          <div className="relative">
            <div className="absolute -left-3 sm:-left-4 md:-left-6 top-0 bottom-0 w-1 sm:w-1.5 bg-[#8D6E63] rounded-full opacity-50"></div>
            <p className="text-[#4E342E] leading-relaxed text-justify text-sm sm:text-base md:text-lg lg:text-xl font-medium opacity-90 pl-4 sm:pl-5 md:pl-6 pr-1 sm:pr-2">
              {content}
            </p>
          </div>

          {/* Keuntungan Section - Poppins & Inter */}
          <div className="bg-white p-6 sm:p-8 md:p-12 lg:p-16 rounded-3xl sm:rounded-[40px] md:rounded-[50px] shadow-md sm:shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 space-y-6 sm:space-y-8 md:space-y-10 mx-2 sm:mx-4 md:mx-0">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#3E2723] tracking-tight mb-1 sm:mb-0">Keuntungan Eksklusif</h3>
              <p className="text-[#8D6E63] font-sans font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest mt-1.5 sm:mt-2">Benefit Member Reseller Mochint</p>
            </div>
            
            <div className="flex flex-wrap gap-2.5 sm:gap-3 md:gap-4 justify-center md:justify-start">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 sm:gap-2.5 md:gap-3 px-3 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 bg-[#FDFBF7] border-2 border-[#8D6E63]/10 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-[#5D4037] font-sans shadow-sm hover:border-[#8D6E63] hover:bg-white transition-all duration-300 group active:scale-95"
                >
                  <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] text-[#8D6E63] group-hover:scale-125 transition-transform shrink-0" />
                  <span className="leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Button Section - Poppins */}
          <div className="pt-6 sm:pt-8 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 px-2 sm:px-4 md:px-0">
            <p className="font-sans font-bold text-gray-400 text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-0">Tertarik bergabung?</p>
            <button 
              onClick={handleOrderNow}
              className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-[#3E2723] text-white rounded-2xl sm:rounded-[20px] md:rounded-[25px] font-display font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-lg sm:shadow-[0_15px_30px_rgba(62,39,35,0.25)] md:shadow-[0_20px_40px_rgba(62,39,35,0.3)] hover:bg-[#8D6E63] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 group active:scale-95 w-full sm:w-auto mx-2 sm:mx-0"
            >
              <span className="leading-tight">Daftar Reseller</span>
            </button>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans font-medium italic text-center px-4">*Syarat dan ketentuan berlaku</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Promo;

