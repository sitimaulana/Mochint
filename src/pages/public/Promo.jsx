import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageCircle, ChevronRight, CheckCircle2, Percent } from 'lucide-react';

const Promo = () => {
  const navigate = useNavigate();

  // Data Keuntungan Statis
  const benefits = ['Facial Signature', 'Premium Masker', 'Skin Analysis', 'Hydrating Treatment', 'Aftercare Consultation'];

  const handleOrderNow = () => {
    const whatsappUrl = "https://wa.me/6281234567890?text=Halo%20Mochint%2C%20saya%20tertarik%20dengan%20Promo%20Diskon%20Reseller%2030%25";
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-[#3E2723]">
      <div className="container mx-auto px-6 md:px-20 pt-8">
        
        {/* Breadcrumbs - Inter */}
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#8D6E63] mb-12 font-sans">
          <button onClick={() => navigate('/')} className="hover:text-[#5D4037] transition-all">
            <Home size={16} />
          </button>
          <span className="opacity-30">/</span>
          <span className="text-[#3E2723]">Promo Exclusive</span>
        </nav>

        {/* Title Section - Poppins */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#8D6E63] p-2 rounded-xl text-white shadow-lg">
            <Percent size={28} />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-[#3E2723] tracking-tight">
            Diskon Reseller
          </h1>
        </div>

        {/* Banner Section */}
        <div className="relative w-full h-[350px] md:h-[600px] rounded-[50px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(141,110,99,0.4)] mb-16 group">
          <img 
            src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80" 
            alt="Promo Diskon Reseller" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          />
          {/* Overlay Text - Poppins */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-12 md:px-24">
            <div className="space-y-4">
              <span className="bg-[#8D6E63] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-lg">Limited Offer</span>
              <h2 className="text-white text-4xl md:text-7xl font-display font-bold leading-[1.1] max-w-xl drop-shadow-2xl tracking-tighter">
                30% discount <br/> <span className="text-[#D7CCC8]">for selected products</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Description Section - Inter */}
        <section className="max-w-5xl mx-auto space-y-16">
          <div className="relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-[#8D6E63] rounded-full opacity-50"></div>
            <p className="text-[#4E342E] leading-relaxed text-justify text-base md:text-xl font-medium opacity-90 pl-6">
              Pelembab Moisturizer BPOM paling ampuh dan Halal MUI. Moisturizer Cream Pronafa Skincare merupakan perawatan 
              hydrating intensif untuk menjaga kelembapan alami kulit. Mengandung Amino Ceramide, Aloe Vera, dan Sodium 
              Hyaluronate, dikombinasikan dengan Copper Tripeptide yang dapat mempercepat pemulihan jaringan kulit Anda 
              secara maksimal dan bercahaya.
            </p>
          </div>

          {/* Keuntungan Section - Poppins & Inter */}
          <div className="bg-white p-10 md:p-16 rounded-[50px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 space-y-10">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-display font-bold text-[#3E2723] tracking-tight">Keuntungan Eksklusif</h3>
              <p className="text-[#8D6E63] font-sans font-bold text-xs uppercase tracking-widest mt-2">Benefit Member Reseller Mochint</p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 px-8 py-4 bg-[#FDFBF7] border-2 border-[#8D6E63]/10 rounded-2xl text-sm font-bold text-[#5D4037] font-sans shadow-sm hover:border-[#8D6E63] hover:bg-white transition-all duration-300 group"
                >
                  <CheckCircle2 size={18} className="text-[#8D6E63] group-hover:scale-125 transition-transform" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Order Button Section - Poppins */}
          <div className="pt-8 flex flex-col items-center gap-6">
            <p className="font-sans font-bold text-gray-400 text-sm uppercase tracking-[0.3em]">Tertarik bergabung?</p>
            <button 
              onClick={handleOrderNow}
              className="flex items-center gap-5 px-16 py-6 bg-[#3E2723] text-white rounded-[25px] font-display font-bold text-xl shadow-[0_20px_40px_rgba(62,39,35,0.3)] hover:bg-[#8D6E63] hover:-translate-y-2 transition-all duration-500 group active:scale-95"
            >
              <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
              Order Now via WhatsApp
            </button>
            <p className="text-[11px] text-gray-400 font-sans font-medium italic">*Syarat dan ketentuan berlaku</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Promo;