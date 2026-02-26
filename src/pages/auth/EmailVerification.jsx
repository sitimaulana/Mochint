import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [devOtpCode, setDevOtpCode] = useState(''); // Store OTP for development

  // Get user data from location state (passed from GoogleCallback)
  const userData = location.state?.user;
  const token = location.state?.token;

  useEffect(() => {
    // If no user data, redirect back to login
    if (!userData || !userData.email) {
      console.log('⚠️ No user data, redirecting to login');
      navigate('/auth/login', { replace: true });
      return;
    }

    console.log('✅ User data received:', userData);
    // Auto-send OTP on mount
    handleSendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!userData?.email) {
      console.log('⚠️ No email found in userData');
      return;
    }
    
    console.log('📤 Sending OTP to:', userData.email);
    setSendingOtp(true);
    
    // Clear previous OTP
    setOtp(['', '', '', '', '', '']);
    setDevOtpCode('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: userData.email,
        name: userData.name
      });

      console.log('✅ OTP Response:', response.data);

      if (response.data.success) {
        setNotification({
          show: true,
          type: 'success',
          message: `Kode OTP telah dikirim ke ${userData.email}`
        });
        setCountdown(60); // 60 seconds countdown
        
        // Show OTP in console and store for development
        if (response.data.otp || response.data.devOTP) {
          const otpCode = response.data.otp || response.data.devOTP;
          console.log('🔑 OTP Code (DEV):', otpCode);
          setDevOtpCode(otpCode); // Store for UI display
        }
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      console.error('Error details:', error.response?.data);
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Gagal mengirim kode OTP. Silakan coba lagi.'
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${lastFilledIndex}`)?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Silakan masukkan 6 digit kode OTP'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: userData.email,
        otp: otpCode
      });

      if (response.data.success) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Email berhasil diverifikasi!'
        });

        // Redirect to set password page after 1 second
        setTimeout(() => {
          navigate('/auth/set-password', {
            state: { user: userData, token: token },
            replace: true
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setNotification({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa'
      });
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8D6E63] rounded-2xl mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[#3E2723] mb-2">
            Verifikasi Email
          </h1>
          <p className="text-[#A1887F] text-sm">
            Kami telah mengirim kode 6 digit ke
          </p>
          <p className="text-[#3E2723] font-bold mt-1">
            {userData.email}
          </p>
        </div>

        {/* OTP Input */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
          <label className="block text-xs font-black text-[#A1887F] uppercase tracking-widest mb-4 text-center">
            Masukkan Kode OTP
          </label>
          
          {/* Development OTP Display */}
          {devOtpCode && (
            <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <p className="text-xs text-yellow-800 font-bold mb-1 text-center">
               OTP Code:
              </p>
              <p className="text-2xl font-mono font-bold text-yellow-900 text-center tracking-widest">
                {devOtpCode}
              </p>
              <button
                onClick={() => {
                  const otpArray = devOtpCode.split('');
                  setOtp(otpArray);
                  // Focus last input
                  setTimeout(() => document.getElementById('otp-5')?.focus(), 100);
                }}
                className="mt-2 w-full text-xs text-yellow-700 hover:text-yellow-900 font-medium"
              >
                Klik untuk isi otomatis
              </button>
            </div>
          )}
          
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-[#FDFBF7] rounded-xl border-2 border-transparent focus:border-[#8D6E63] outline-none transition-all"
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-4 bg-[#8D6E63] text-white font-display font-bold rounded-2xl text-sm uppercase tracking-widest hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                Verifikasi <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-[#A1887F] mb-2">
            Tidak menerima kode?
          </p>
          <button
            onClick={handleSendOtp}
            disabled={countdown > 0 || sendingOtp}
            className="text-[#8D6E63] font-bold text-sm hover:text-[#5D4037] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingOtp ? (
              'Mengirim...'
            ) : countdown > 0 ? (
              `Kirim ulang dalam ${countdown}s`
            ) : (
              'Kirim Ulang Kode'
            )}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 w-full sm:min-w-[320px] sm:max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
