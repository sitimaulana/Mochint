import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const SetPassword = ({ onBack }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Email tidak boleh kosong'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Format email tidak valid'
      });
      return;
    }

    setIsLoading(true);

    try {
      navigate('/auth/verify-email', {
        state: { 
          user: { email: email },
          isForgotPassword: true
        },
        replace: true
      });
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        
        {onBack ? (
          <button 
            onClick={onBack}
            className="group flex items-center text-[#8D6E63] hover:text-[#3E2723] text-xs sm:text-sm font-semibold mb-6 sm:mb-8 transition-all"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px] mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Login
          </button>
        ) : (
          <button 
            onClick={() => navigate('/auth/login')}
            className="group flex items-center text-[#8D6E63] hover:text-[#3E2723] text-xs sm:text-sm font-semibold mb-6 sm:mb-8 transition-all"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px] mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Login
          </button>
        )}

        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-brown-100/20 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#8D6E63] rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <Mail size={28} className="sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Lupa Password?</h3>
              <p className="text-[#A1887F] text-xs sm:text-sm mt-2 text-center px-4">
                Masukkan email Anda dan kami akan mengirimkan kode verifikasi untuk reset password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-[11px] font-bold text-[#A1887F] ml-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A1887F] group-focus-within:text-[#3E2723] transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  <input 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:border-[#8D6E63] focus:bg-white transition-all outline-none text-[#3E2723] font-medium text-sm sm:text-base" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 sm:py-4 mt-2 font-bold rounded-xl sm:rounded-2xl shadow-lg transition-all transform active:scale-[0.98] text-xs sm:text-sm tracking-wide ${
                  isLoading
                    ? 'bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed' 
                    : 'bg-[#3E2723] text-white hover:bg-[#5D4037] hover:shadow-[#3E2723]/30'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MEMPROSES...</span>
                  </div>
                ) : "KIRIM KODE VERIFIKASI"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-[#A1887F] mt-6 sm:mt-8">
          Sudah ingat password Anda?{' '}
          <button 
            type="button"
            onClick={onBack || (() => navigate('/auth/login'))} 
            className="text-[#3E2723] font-extrabold hover:underline transition-all"
          >
            Login Sekarang
          </button>
        </p>
      </div>

      {/* Notification - Responsive Style */}
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
                  {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
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
    </div>
  );
};

export default SetPassword;
