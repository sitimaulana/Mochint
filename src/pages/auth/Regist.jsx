import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/client';
import { UserPlus, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Regist = ({ onSwitch, onRegisterSuccess, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const activeUser = localStorage.getItem('active_user');
    const adminToken = localStorage.getItem('token');
    
    if (activeUser) {
      navigate('/member');
    } else if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validasi data
      if (formData.password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }
      
      // Mengirim data ke database melalui API
      const res = await authAPI.register(formData);
      
      if (res.success) {
        alert(`Pendaftaran Berhasil!\nSelamat bergabung di Mochint Beauty Care.`);
        
        // Panggil callback jika ada
        if (onRegisterSuccess) {
          onRegisterSuccess(res.user);
        } else {
          // Default: pindah ke halaman login
          onSwitch(); 
        }
      }
    } catch (error) {
      setError(error.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  // Check if Google OAuth is configured (set to false for now until credentials are setup)
  const isGoogleOAuthEnabled = true; // Change to true after setting up Google OAuth credentials

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        
        {/* Tombol Kembali */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-[#8D6E63] hover:text-[#3E2723] font-bold mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Kembali
          </button>
        )}

        <div className="p-8 md:p-12 bg-white rounded-[45px] shadow-2xl font-sans text-[#3E2723]">
          {/* Header Logo */}
          <div className="text-center mb-10">
            <div className="mx-auto mb-6">
              <img src="/logomochint.svg" alt="Mochint Logo" className="w-32 h-32 mx-auto drop-shadow-2xl" />
            </div>
          </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        <UserPlus size={18} className="text-[#8D6E63]" />
        <h3 className="text-xl font-display font-bold text-[#3E2723]">Buat Akun Member</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Row 1: Nama & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="text-left">
            <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Nama Anda" 
              required 
              className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Email</label>
            <input 
              type="email" 
              placeholder="email@gmail.com" 
              required 
              className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Row 2: Nomor HP & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="text-left">
            <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Nomor HP</label>
            <input 
              type="tel" 
              placeholder="+62 8xx" 
              required 
              className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 Karakter" 
                required 
                minLength="8"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#8D6E63] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Input Alamat */}
        <div className="text-left">
          <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Alamat Lengkap</label>
          <textarea 
            placeholder="Tuliskan alamat lengkap..." 
            required 
            rows="2"
            className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all resize-none font-medium placeholder:text-gray-300 shadow-sm"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          ></textarea>
        </div>

        <div className="flex items-start gap-3 bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
          <ShieldCheck size={18} className="text-[#8D6E63] shrink-0" />
          <p className="text-[10px] text-[#A1887F] leading-relaxed font-medium font-sans">
            Dengan mendaftar, Anda menyetujui <span className="text-[#8D6E63] font-bold">Syarat & Ketentuan Layanan</span> serta Kebijakan Privasi Mochint Beauty Care.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-5 bg-[#3E2723] text-white text-xs font-display font-bold rounded-[20px] shadow-xl hover:bg-[#8D6E63] active:scale-[0.97] transition-all disabled:opacity-50 mt-2 uppercase tracking-[0.2em]"
        >
          {isSubmitting ? "Sedang Memproses..." : "Daftar Akun Sekarang"}
        </button>

        {/* Divider - Only show if Google OAuth is enabled */}
        {isGoogleOAuthEnabled && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-xs text-[#A1887F] font-medium">ATAU</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Tombol Google Register */}
            <button 
              type="button"
              onClick={handleGoogleRegister}
              className="w-full py-5 font-bold rounded-[20px] shadow-xl transition-all active:scale-[0.97] text-xs uppercase tracking-[0.2em] bg-white text-[#3E2723] border-2 border-gray-200 hover:border-[#8D6E63] hover:shadow-2xl flex items-center justify-center gap-3"
            >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Daftar dengan Google
        </button>
          </>
        )}
      </form>

      {/* Footer Switch */}
      <p className="text-center mt-10 text-[13px] text-gray-400 font-medium font-sans">
        Sudah punya akun?{' '}
        <button 
          type="button"
          onClick={onSwitch} 
          className="text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors border-b border-[#8D6E63]/20 hover:border-[#3E2723]"
        >
          Login di sini
        </button>
      </p>
    </div>
      </div>
    </div>
  );
};

export default Regist;