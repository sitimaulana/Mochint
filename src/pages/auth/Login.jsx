import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/client';

const Login = ({ onSwitch, onForgot, onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const activeUser = localStorage.getItem('active_user');
    const adminToken = localStorage.getItem('token');
    
    // Check for password reset success
    if (location.state?.passwordResetSuccess) {
      setNotification({
        show: true,
        type: 'success',
        message: 'Password berhasil diubah! Silakan login dengan password baru Anda.'
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }
    
    // Check for Google OAuth error
    const googleError = searchParams.get('error');
    if (googleError) {
      if (googleError === 'google_auth_failed') {
        setNotification({
          show: true,
          type: 'error',
          message: 'Gagal login dengan Google. Silakan coba lagi atau gunakan metode login lain.'
        });
      } else if (googleError === 'server_error') {
        setNotification({
          show: true,
          type: 'error',
          message: 'Terjadi kesalahan pada server. Mohon tunggu beberapa saat dan coba lagi.'
        });
      } else if (googleError === 'invalid_callback') {
        setNotification({
          show: true,
          type: 'error',
          message: 'Callback tidak valid. Silakan login kembali.'
        });
      } else if (googleError === 'missing_data') {
        setNotification({
          show: true,
          type: 'error',
          message: 'Data login tidak lengkap. Silakan coba lagi.'
        });
      }
    }
    
    if (activeUser) {
      navigate('/member');
    } else if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate, searchParams, location]);

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotification({ show: false, type: '', message: '' });
    setIsLoading(true);

    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        setNotification({
          show: true,
          type: 'success',
          message: `Selamat datang kembali!`
        });
        
        // Delay redirect untuk menampilkan notifikasi
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
          const userRole = res.user.role || res.user.user_type;
          if (userRole === 'admin' || res.user.is_admin === true) {
            navigate('/admin');
          } else {
            navigate('/member');
          }
        }, 1500);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: res.message || "Email atau password yang Anda masukkan salah. Periksa kembali dan coba lagi."
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error types
      let errorMessage = "Login gagal. Silakan coba lagi.";
      
      if (err.response) {
        // Server responded with error
        const statusCode = err.response.status;
        
        if (statusCode === 401) {
          errorMessage = "Email atau password yang Anda masukkan salah. Periksa kembali dan coba lagi.";
        } else if (statusCode === 404) {
          errorMessage = "Akun tidak ditemukan. Silakan daftar terlebih dahulu.";
        } else if (statusCode === 500) {
          errorMessage = "Terjadi kesalahan pada server. Mohon coba lagi dalam beberapa saat.";
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // No response from server
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        // Other errors
        errorMessage = err.message || errorMessage;
      }
      
      setNotification({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  // Check if Google OAuth is configured
  const isGoogleOAuthEnabled = true;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans">
      {/* Notification Toast - Responsive Style */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 w-full sm:min-w-[320px] sm:max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-xs sm:text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.type === 'success' ? 'Berhasil!' : 'Login Gagal!'}
                </h3>
                <p className={`mt-1 text-xs sm:text-sm ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className={`ml-4 flex-shrink-0 rounded-md inline-flex ${
                  notification.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'
                }`}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="Masukkan password Anda" 
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
                    onClick={onForgot || (() => navigate('/auth/forgot-password'))}
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

              {/* Divider - Only show if Google OAuth is enabled */}
              {isGoogleOAuthEnabled && (
                <>
                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-xs text-[#A1887F] font-medium">ATAU</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  {/* Tombol Google Login */}
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-4 font-bold rounded-2xl shadow-lg transition-all transform active:scale-[0.98] text-sm tracking-wide bg-white text-[#3E2723] border-2 border-gray-200 hover:border-[#8D6E63] hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    MASUK DENGAN GOOGLE
                  </button>
                </>
              )}
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
