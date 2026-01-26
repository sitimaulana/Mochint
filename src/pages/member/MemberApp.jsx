import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import Login from '../auth/Login';
import Register from '../auth/Regist';

const MemberApp = () => {
  const location = useLocation();
  
  // State untuk kontrol modal
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Menangkap perintah buka modal dari Home (handleBookingClick)
  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
    }
    if (location.state?.openRegister) {
      setShowRegister(true);
    }
  }, [location]);

  // --- LOGIKA PERPINDAHAN MODAL ---
  const openRegister = () => {
    setShowLogin(false);
    setShowForgotPassword(false);
    setShowRegister(true);
  };

  const openLogin = () => {
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowLogin(true);
  };

  const openForgot = () => {
    setShowLogin(false);
    setShowForgotPassword(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Konten Utama Page 1 - Poppins */}
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-7xl font-display font-bold text-[#3E2723] leading-tight tracking-tighter">
          Welcome to <br /> 
          <span className="text-[#8D6E63]">Mochint Beauty Care</span>
        </h1>
        <p className="text-[#8D6E63] font-sans font-medium max-w-md mx-auto leading-relaxed opacity-80">
          Silakan masuk untuk mengakses profil eksklusif, riwayat perawatan, dan layanan prioritas kami.
        </p>
      </div>

      {/* Tombol Login - Poppins */}
      <button 
        onClick={() => setShowLogin(true)}
        className="px-16 py-5 bg-[#3E2723] text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-[#3E2723]/30 hover:bg-[#8D6E63] transition-all duration-500 w-full max-w-xs mb-8 transform active:scale-95"
      >
        Login to Account
      </button>

      {/* Link Daftar - Inter */}
      <p className="text-[13px] text-gray-400 font-medium">
        Belum memiliki akun member?{' '}
        <button onClick={openRegister} className="text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors border-b border-[#8D6E63]/20">
          Daftar sekarang
        </button>
      </p>

      {/* === 1. POPUP LOGIN === */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-white rounded-[45px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowLogin(false)} 
              className="absolute top-8 right-8 p-2 bg-[#FDFBF7] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>
            <Login onSwitch={openRegister} onForgot={openForgot} />
          </div>
        </div>
      )}

      {/* === 2. POPUP REGISTER === */}
      {showRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-2xl bg-white rounded-[45px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowRegister(false)} 
              className="absolute top-8 right-8 p-2 bg-[#FDFBF7] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>
            <Register onSwitch={openLogin} />
          </div>
        </div>
      )}

      {/* === 3. POPUP LUPA PASSWORD === */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-white rounded-[45px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-12 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowForgotPassword(false)} 
              className="absolute top-8 right-8 p-2 bg-[#FDFBF7] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#FDFBF7] text-[#8D6E63] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Mail size={32} />
              </div>
              <h3 className="text-3xl font-display font-bold text-[#3E2723] tracking-tight">Reset Password</h3>
              <p className="text-sm font-sans font-medium text-[#8D6E63] mt-3 leading-relaxed opacity-80">
                Masukkan email Anda untuk menerima instruksi pemulihan kata sandi.
              </p>
            </div>

            <form className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Registered Email</label>
                <input 
                  type="email" 
                  placeholder="username@gmail.com" 
                  className="w-full px-6 py-4 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none transition-all font-sans font-medium text-sm"
                  required
                />
              </div>
              <button 
                type="button"
                onClick={() => {
                  alert("Link reset password telah dikirim ke email Anda!");
                  setShowForgotPassword(false);
                }}
                className="w-full py-5 bg-[#3E2723] text-white font-display font-bold rounded-2xl shadow-xl hover:bg-[#8D6E63] transition-all uppercase tracking-widest text-xs"
              >
                Send Instructions
              </button>
            </form>
            
            <button 
              onClick={openLogin} 
              className="w-full flex items-center justify-center gap-2 mt-8 text-sm text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors font-sans"
            >
              <ArrowLeft size={16} /> Kembali ke Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberApp;