import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }

        // Tentukan role untuk redirect
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
      // Error handling yang lebih user-friendly
      if (err.message.includes('Failed to fetch')) {
        setError('Tidak dapat terhubung ke server. Silakan coba lagi nanti.');
      } else {
        setError(err.message || "Login gagal, periksa kembali akun Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgot) {
      onForgot();
    } else {
      alert('Fitur lupa password belum tersedia. Silakan hubungi admin.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Tombol Kembali */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-[#8D6E63] hover:text-[#3E2723] font-bold mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Kembali
          </button>
        )}
        
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#3E2723] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white font-bold text-4xl">M</span>
          </div>
          <h1 className="text-4xl font-bold text-[#3E2723] mb-2">MOCHINT</h1>
          <p className="text-sm font-black text-[#8D6E63] tracking-[0.4em] uppercase">BEAUTY CARE</p>
        </div>


        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <span className="font-bold">❌ Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div>
              <label className="block text-xs font-black text-[#A1887F] mb-2 uppercase tracking-[0.2em]">
                EMAIL ADDRESS
              </label>
              <input 
                type="email" 
                placeholder="username@gmail.com" 
                required 
                value={email}
                className="w-full px-5 py-4 rounded-xl bg-[#FDFBF7] outline-none border-2 border-[#F0E6D6] focus:bg-white focus:border-[#8D6E63] focus:ring-0 transition-all text-[#3E2723] placeholder-[#A1887F] font-medium" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-xs font-black text-[#A1887F] mb-2 uppercase tracking-[0.2em]">
                PASSWORD
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="**********" 
                  required 
                  value={password}
                  className="w-full px-5 py-4 pr-12 rounded-xl bg-[#FDFBF7] outline-none border-2 border-[#F0E6D6] focus:bg-white focus:border-[#8D6E63] focus:ring-0 transition-all text-[#3E2723] placeholder-[#A1887F] font-medium" 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#8D6E63] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="text-right mt-3">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs text-[#8D6E63] hover:text-[#3E2723] font-bold transition-colors hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 font-bold rounded-xl shadow-lg mt-4 transition-all transform active:scale-[0.98] text-sm uppercase tracking-[0.1em] ${
                isLoading
                  ? 'bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed' 
                  : 'bg-[#3E2723] text-white hover:bg-[#5D4037] shadow-[#3E2723]/20'
              }`}
            >
              {isLoading ? "Memproses..." : "LOGIN TO ACCOUNT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;