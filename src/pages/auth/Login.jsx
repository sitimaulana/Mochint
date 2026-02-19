import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import api from '../../api/client';

const Login = ({ onSwitch, onForgot, onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const activeUser = localStorage.getItem('active_user');
    const adminToken = localStorage.getItem('token');
    
    if (activeUser) {
      navigate('/member');
    } else if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        const userRole = res.user.role || res.user.user_type;
        if (userRole === 'admin' || res.user.is_admin === true) {
          navigate('/admin');
        } else {
          navigate('/member');
        }
      } else {
        setError(res.message || "Email atau password salah");
      }
    } catch (err) {
      setError(err.message.includes('Failed to fetch') 
        ? 'Tidak dapat terhubung ke server.' 
        : err.message || "Login gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Tombol Kembali - Dibuat lebih subtle */}
        {onBack && (
          <button 
            onClick={onBack}
            className="group flex items-center text-[#8D6E63] hover:text-[#3E2723] text-sm font-semibold mb-8 transition-all"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Beranda
          </button>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-brown-100/20 overflow-hidden">
          <div className="p-8 md:p-10">
            
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="mb-6">
                <img src="/logomochint.svg" alt="Mochint Logo" className="w-40 h-40 drop-shadow-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-[#3E2723]">Selamat Datang</h3>
              <p className="text-[#A1887F] text-sm mt-1">Silakan masuk ke akun Anda</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm animate-pulse">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Input Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1887F] ml-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1887F] group-focus-within:text-[#3E2723] transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:border-[#8D6E63] focus:bg-white transition-all outline-none text-[#3E2723] font-medium" 
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1887F] ml-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1887F] group-focus-within:text-[#3E2723] transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:border-[#8D6E63] focus:bg-white transition-all outline-none text-[#3E2723] font-medium" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#3E2723]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end pr-1">
                  <button 
                    type="button" 
                    onClick={onForgot}
                    className="text-xs text-[#8D6E63] hover:text-[#3E2723] font-bold transition-colors"
                  >
                    Lupa Password?
                  </button>
                </div>
              </div>

              {/* Tombol Login */}
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 mt-2 font-bold rounded-2xl shadow-lg transition-all transform active:scale-[0.98] text-sm tracking-wide ${
                  isLoading
                    ? 'bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed' 
                    : 'bg-[#3E2723] text-white hover:bg-[#5D4037] hover:shadow-[#3E2723]/30'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>MEMPROSES...</span>
                  </div>
                ) : "MASUK KE AKUN"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Switch */}
        <p className="text-center text-sm text-[#A1887F] mt-8">
          Belum punya akun?{' '}
          <button 
            type="button"
            onClick={onSwitch} 
            className="text-[#3E2723] font-extrabold hover:underline transition-all"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;