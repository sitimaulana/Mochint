import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Get user data from location state
  const userData = location.state?.user;
  const token = location.state?.token;
  const isForgotPassword = location.state?.isForgotPassword || false; // Check if this is forgot password flow

  useEffect(() => {
    // If no user data, redirect to login
    if (!userData || !userData.email) {
      navigate('/auth/login', { replace: true });
    }
    console.log('ðŸ” SetPassword - Flow type:', isForgotPassword ? 'Forgot Password' : 'Google OAuth');
  }, [userData, navigate, isForgotPassword]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  const validatePassword = () => {
    if (password.length < 8) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Password minimal 8 karakter'
      });
      return false;
    }

    if (password !== confirmPassword) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Password tidak cocok'
      });
      return false;
    }

    return true;
  };

  const handleSetPassword = async () => {
    if (!validatePassword()) return;

    console.log('ðŸ” Setting password for:', userData.email);
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/set-password', {
        email: userData.email,
        password: password,
        userId: userData.id
      });

      console.log('âœ… Password set response:', response.data);

      if (response.data.success) {
        if (isForgotPassword) {
          // Forgot password flow - redirect to login with success message
          setNotification({
            show: true,
            type: 'success',
            message: 'Password berhasil diubah! Silakan login dengan password baru...'
          });

          console.log('âœ… Password reset successful, redirecting to login...');

          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/auth/login', { 
              replace: true,
              state: { passwordResetSuccess: true }
            });
          }, 2000);
        } else {
          // Google OAuth flow - store auth data and redirect to dashboard
          setNotification({
            show: true,
            type: 'success',
            message: 'Password berhasil dibuat! Mengalihkan ke dashboard...'
          });

          // Store authentication data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('active_user', JSON.stringify(userData));
          localStorage.setItem('user_type', 'member');
          localStorage.setItem('login_time', new Date().toISOString());

          console.log('âœ… Redirecting to member dashboard...');

          // Redirect to member dashboard after 1.5 seconds
          setTimeout(() => {
            navigate('/member', { replace: true });
          }, 1500);
        }
      }
    } catch (error) {
      console.error('âŒ Error setting password:', error);
      console.error('Error details:', error.response?.data);
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Gagal membuat password. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password && confirmPassword) {
      handleSetPassword();
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8D6E63] rounded-2xl mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[#3E2723] mb-2">
            {isForgotPassword ? 'Reset Password' : 'Buat Password'}
          </h1>
          <p className="text-[#A1887F] text-sm">
            {isForgotPassword 
              ? 'Buat password baru untuk akun Anda'
              : 'Buat password untuk akun Mochint Anda'
            }
          </p>
          <p className="text-[#3E2723] font-bold mt-1">
            {userData.email}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-xs font-black text-[#A1887F] uppercase tracking-widest mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Minimal 8 karakter"
                className="w-full bg-[#FDFBF7] px-4 py-3 pr-12 rounded-xl border-2 border-transparent focus:border-[#8D6E63] outline-none text-sm font-medium"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A1887F] hover:text-[#8D6E63]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        index < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  passwordStrength <= 1 ? 'text-red-600' : 
                  passwordStrength === 2 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label className="block text-xs font-black text-[#A1887F] uppercase tracking-widest mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ulangi password"
                className="w-full bg-[#FDFBF7] px-4 py-3 pr-12 rounded-xl border-2 border-transparent focus:border-[#8D6E63] outline-none text-sm font-medium"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A1887F] hover:text-[#8D6E63]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                {password === confirmPassword ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Password cocok
                  </p>
                ) : (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> Password tidak cocok
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-[#FDFBF7] rounded-xl p-4 mb-6">
            <p className="text-xs font-black text-[#A1887F] uppercase tracking-widest mb-2">
              Persyaratan Password:
            </p>
            <ul className="space-y-1 text-xs text-[#5D4037]">
              <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                Minimal 8 karakter
              </li>
              <li className={`flex items-center gap-2 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                <span className={`w-1 h-1 rounded-full ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                Kombinasi huruf besar & kecil (disarankan)
              </li>
              <li className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-600' : ''}`}>
                <span className={`w-1 h-1 rounded-full ${/\d/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                Mengandung angka (disarankan)
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSetPassword}
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            className="w-full py-4 bg-[#8D6E63] text-white font-display font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Buat Password & Lanjutkan <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
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

