import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/client';
import { UserPlus, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from '/src/components/icons';

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
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const activeUser = localStorage.getItem('active_user');
    const adminToken = localStorage.getItem('token');
    
    if (activeUser) {
      navigate('/member');
    } else if (adminToken) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Form submitted with data:', formData);
    
    // Reset notifikasi dan errors
    setNotification({ show: false, type: '', message: '' });
    setFieldErrors({});

    // Validasi manual
    const errors = {};
    let errorMessages = [];

    // Validasi Nama
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Nama lengkap wajib diisi';
      errorMessages.push('Nama lengkap');
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nama minimal 3 karakter';
      errorMessages.push('Nama (minimal 3 karakter)');
    }

    // Validasi Email
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email wajib diisi';
      errorMessages.push('Email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
      errorMessages.push('Email (format tidak valid)');
    }

    // Validasi Nomor HP
    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = 'Nomor HP wajib diisi';
      errorMessages.push('Nomor HP');
    } else if (!formData.phone.match(/^(\+62|62|0)[0-9]{9,12}$/)) {
      errors.phone = 'Format nomor HP tidak valid';
      errorMessages.push('Nomor HP (format: 08xx atau +628xx)');
    }

    // Validasi Password
    if (!formData.password || formData.password === '') {
      errors.password = 'Password wajib diisi';
      errorMessages.push('Password');
    } else if (formData.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
      errorMessages.push('Password (minimal 8 karakter)');
    }

    // Validasi Alamat
    if (!formData.address || formData.address.trim() === '') {
      errors.address = 'Alamat lengkap wajib diisi';
      errorMessages.push('Alamat lengkap');
    } else if (formData.address.trim().length < 10) {
      errors.address = 'Alamat minimal 10 karakter';
      errorMessages.push('Alamat (minimal 10 karakter)');
    }

    console.log('🔍 Validation errors:', errors);
    console.log('🔍 Error messages:', errorMessages);

    // Jika ada error, tampilkan notifikasi
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      
      const message = errorMessages.length === 1 
        ? `Mohon isi data ${errorMessages[0]} dengan lengkap`
        : `Mohon lengkapi data berikut: ${errorMessages.join(', ')}`;
      
      console.log('Showing notification:', message);
      
      setNotification({
        show: true,
        type: 'error',
        message: `${message}`
      });
      
      // Scroll ke atas untuk melihat notifikasi
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      return; // Stop execution
    }

    // Jika tidak ada error, lanjutkan registrasi
    setIsSubmitting(true);
    
    try {
      console.log('✅ All validations passed, submitting to API...');
      
      const res = await authAPI.register(formData);
      
      if (res.success) {
        setNotification({
          show: true,
          type: 'success',
          message: `Selamat! Akun Anda berhasil dibuat`
        });
        
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(res.user);
          } else {
            onSwitch(); 
          }
        }, 2000);
      }
    } catch (error) {
      console.error(' Registration error:', error);
      console.error('Error response:', error.response);
      
      // Handle specific error codes
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        console.log(' Status Code:', statusCode);
        console.log(' Error Data:', errorData);
        
        switch (statusCode) {
          case 409:
            // Email sudah digunakan
            setNotification({
              show: true,
              type: 'error',
              message: 'Email sudah terdaftar! Silakan gunakan email lain atau login dengan akun yang sudah ada.'
            });
            // Highlight email field
            setFieldErrors({ email: 'Email ini sudah terdaftar' });
            break;
            
          case 400:
            // Bad request (validasi server)
            const serverMessage = errorData.message || 'Data yang Anda masukkan tidak valid';
            setNotification({
              show: true,
              type: 'error',
              message: `${serverMessage}`
            });
            break;
            
          case 500:
            // Server error
            setNotification({
              show: true,
              type: 'error',
              message: 'Terjadi kesalahan pada server. Mohon coba lagi dalam beberapa saat.'
            });
            break;
            
          default:
            setNotification({
              show: true,
              type: 'error',
              message: errorData.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
            });
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada response (network error)
        setNotification({
          show: true,
          type: 'error',
          message: '🌐 Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        });
      } else {
        // Error lainnya
        setNotification({
          show: true,
          type: 'error',
          message: error.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
        });
      }
      
      // Scroll ke atas untuk melihat notifikasi
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = '/api/auth/google';
  };

  const isGoogleOAuthEnabled = true;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans">
      {/* Notification Toast - ALWAYS VISIBLE FOR TESTING */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] animate-slide-in-right">
          <div className={`rounded-lg shadow-2xl p-3 sm:p-4 w-full sm:min-w-[320px] sm:max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm sm:text-base font-bold ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.type === 'success' ? 'Pendaftaran Berhasil!' : 'Pendaftaran Gagal!'}
                </h3>
                <p className={`mt-1 text-xs sm:text-sm font-medium ${
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
                <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Row 1: Nama & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Tuliskan nama Anda" 
                  className={`w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 ${
                    fieldErrors.name ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-[#8D6E63]'
                  } focus:bg-white outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    if (fieldErrors.name) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.name;
                      setFieldErrors(newErrors);
                    }
                  }}
                />
                {fieldErrors.name && (
                  <p className="text-red-600 text-[10px] mt-1.5 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.name}
                  </p>
                )}
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  placeholder=" Tuliskan email Anda" 
                  className={`w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 ${
                    fieldErrors.email ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-[#8D6E63]'
                  } focus:bg-white outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (fieldErrors.email) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.email;
                      setFieldErrors(newErrors);
                    }
                  }}
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-[10px] mt-1.5 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Nomor HP & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Tuliskan nomor HP Anda" 
                  className={`w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 ${
                    fieldErrors.phone ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-[#8D6E63]'
                  } focus:bg-white outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm`}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (fieldErrors.phone) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.phone;
                      setFieldErrors(newErrors);
                    }
                  }}
                />
                {fieldErrors.phone && (
                  <p className="text-red-600 text-[10px] mt-1.5 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.phone}
                  </p>
                )}
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimal 8 karakter" 
                    minLength="8"
                    className={`w-full px-5 py-3.5 pr-12 rounded-2xl bg-[#FDFBF7] border-2 ${
                      fieldErrors.password ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-[#8D6E63]'
                    } focus:bg-white outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm`}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if (fieldErrors.password) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.password;
                        setFieldErrors(newErrors);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#8D6E63] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-600 text-[10px] mt-1.5 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Input Alamat */}
            <div className="text-left">
              <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="address"
                placeholder="Tuliskan alamat lengkap Anda" 
                rows="2"
                className={`w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 ${
                  fieldErrors.address ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-transparent focus:border-[#8D6E63]'
                } focus:bg-white outline-none text-sm transition-all resize-none font-medium placeholder:text-gray-300 shadow-sm`}
                value={formData.address}
                onChange={(e) => {
                  setFormData({...formData, address: e.target.value});
                  if (fieldErrors.address) {
                    const newErrors = {...fieldErrors};
                    delete newErrors.address;
                    setFieldErrors(newErrors);
                  }
                }}
              ></textarea>
              {fieldErrors.address && (
                <p className="text-red-600 text-[10px] mt-1.5 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.address}
                </p>
              )}
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
              className="w-full py-5 bg-[#3E2723] text-white text-xs font-display font-bold rounded-[20px] shadow-xl hover:bg-[#8D6E63] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-[0.2em]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>MEMPROSES...</span>
                </div>
              ) : "DAFTAR"}
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
                Google
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

