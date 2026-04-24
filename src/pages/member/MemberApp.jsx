import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from '../auth/Login';
import Register from '../auth/Regist';

const MemberApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State untuk kontrol modal
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Cek apakah sudah login
  useEffect(() => {
    const activeUser = localStorage.getItem('active_user');
    const adminToken = localStorage.getItem('token');
    
    if (activeUser) {
      navigate('/member');
      return;
    } else if (adminToken) {
      navigate('/admin/dashboard');
      return;
    }
  }, [navigate]);

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
    setShowRegister(true);
  };

  const openLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const openForgot = () => {
    // Navigate to dedicated forgot password page
    navigate('/auth/forgot-password');
  };

  // Jika showLogin true, tampilkan halaman login penuh
  if (showLogin) {
    return <Login onSwitch={openRegister} onForgot={openForgot} onBack={() => setShowLogin(false)} />;
  }

  // Jika showRegister true, tampilkan halaman register penuh
  if (showRegister) {
    return <Register onSwitch={openLogin} onBack={() => setShowRegister(false)} />;
  }

  // Landing page default
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
        Masuk
      </button>

      {/* Link Daftar - Inter */}
      <p className="text-[13px] text-gray-400 font-medium">
        Belum memiliki akun member?{' '}
        <button onClick={openRegister} className="text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors border-b border-[#8D6E63]/20">
          Daftar sekarang
        </button>
      </p>

    </div>
  );
};

export default MemberApp;