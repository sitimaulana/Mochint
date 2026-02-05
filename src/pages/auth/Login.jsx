import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const Login = ({ onSwitch, onForgot, onLoginSuccess }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const navigate = useNavigate();

  // Cek status server saat komponen dimuat
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      if (response.ok) {
        const data = await response.json();
        setServerStatus('online');
        console.log('✅ Server status: ONLINE', data);
      } else {
        setServerStatus('offline');
        console.log('❌ Server status: OFFLINE');
      }
    } catch (error) {
      setServerStatus('offline');
      console.log('❌ Server status: OFFLINE -', error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('🔄 Login attempt for:', email);
      
      // Cek server status dulu
      if (serverStatus === 'offline') {
        throw new Error('Backend server offline. Pastikan server berjalan di port 5000.');
      }
      
      console.log('🔍 Server status:', serverStatus);
      console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      
      // Coba koneksi ke endpoint test dulu
      try {
        const testResult = await api.testAPIConnection();
        console.log('✅ API Connection test:', testResult);
      } catch (testError) {
        console.warn('⚠️ API test failed, but continuing login attempt:', testError.message);
      }
      
      // Lakukan login
      console.log('🔑 Attempting login...');
      const res = await api.auth.login(email, password);
      
      if (res.success) {
        console.log('✅ Login successful!');
        console.log('👤 User data:', {
          id: res.user.id,
          name: res.user.name || res.user.full_name,
          email: res.user.email,
          user_type: res.user.user_type,
          role: res.user.role,
          is_admin: res.user.is_admin
        });
        
        console.log('🔍 Token received:', res.token ? '✅ Yes' : '❌ No');
        
        // Verifikasi data tersimpan di localStorage
        setTimeout(() => {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          console.log('📦 LocalStorage verification:', {
            token: token ? `✅ (${token.length} chars)` : '❌ Missing',
            user: userStr ? '✅ Present' : '❌ Missing',
            user_type: localStorage.getItem('user_type') || 'Not set'
          });
          
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              console.log('📋 User in localStorage:', {
                role: user.role,
                user_type: user.user_type,
                name: user.name || user.full_name
              });
            } catch (parseError) {
              console.error('Error parsing user from localStorage:', parseError);
            }
          }
        }, 100);
        
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        
        // Gunakan role jika ada, jika tidak gunakan user_type
        const userRole = res.user.role || res.user.user_type;
        
        console.log(`📍 Redirecting based on: ${userRole}`);
        console.log(`   - role: ${res.user.role}`);
        console.log(`   - user_type: ${res.user.user_type}`);
        console.log(`   - is_admin: ${res.user.is_admin}`);
        
        setTimeout(() => {
          if (userRole === 'admin' || res.user.is_admin === true) {
            console.log('📍 Redirecting to admin dashboard');
            navigate('/admin');
          } else {
            console.log('📍 Redirecting to member dashboard');
            navigate('/member');
          }
        }, 300);
        
      } else {
        console.error('❌ Login failed from API:', res.message);
        setError(res.message || "Login gagal");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Detailed error logging
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // User-friendly error messages
      if (err.message.includes('Backend server offline')) {
        setError('Backend server tidak berjalan. Pastikan server berjalan di port 5000.');
      } else if (err.message.includes('Password admin salah')) {
        setError('Password admin salah');
      } else if (err.message.includes('Password member salah')) {
        setError('Password member salah');
      } else if (err.message.includes('Email tidak terdaftar')) {
        setError('Email tidak terdaftar');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Tidak dapat terhubung ke server backend. Periksa: \n1. Apakah server berjalan?\n2. Apakah port 5000 tersedia?\n3. Apakah ada firewall?');
      } else if (err.message.includes('network')) {
        setError('Masalah koneksi jaringan. Periksa koneksi internet Anda.');
      } else if (err.message.includes('timeout')) {
        setError('Koneksi timeout. Server mungkin sedang sibuk.');
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

  // Fungsi untuk auto-fill credentials
  const handleAutoFill = (userType) => {
    const credentials = {
      admin: {
        email: 'admin@mochint.com',
        password: 'admin123'
      },
      member: {
        email: 'siltiana@gmail.com',
        password: 'labubu'
      },
      herwin: {
        email: 'herwin@gmail.com',
        password: 'herwin123'
      }
    };
    
    const creds = credentials[userType];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setError('');
    }
  };

  // Fungsi untuk test server connection
  const handleTestServer = async () => {
    try {
      console.log('🔗 Testing server connection...');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Test health endpoint
      const healthResponse = await fetch(`${API_URL.replace('/api', '')}/health`);
      const healthData = await healthResponse.json();
      
      // Test API endpoint
      const apiResponse = await fetch(`${API_URL}/test`);
      const apiData = await apiResponse.json();
      
      const message = `
✅ Server Status: ONLINE
📍 URL: ${API_URL}

Health Check:
- Status: ${healthData.status}
- Database: ${healthData.services?.database}

API Test:
- Message: ${apiData.message}
- Admin Users: ${apiData.database?.admin_users}
- Members: ${apiData.database?.members}

Credentials Available:
- Admin: admin@mochint.com / admin123
- Member: siltiana@gmail.com / labubu
`;
      
      alert(message);
      setServerStatus('online');
      
    } catch (error) {
      const errorMessage = `
❌ Server Status: OFFLINE
📍 URL: http://localhost:5000

Error: ${error.message}

Solusi:
1. Buka terminal baru
2. cd ke folder backend
3. Jalankan: node server.js
4. Tunggu sampai muncul "Server running on http://localhost:5000"
`;
      alert(errorMessage);
      setServerStatus('offline');
    }
  };

  // Fungsi untuk start backend server (simulasi)
  const handleStartBackend = () => {
    alert(`Untuk menjalankan backend server:

1. Buka terminal baru
2. Masuk ke direktori backend:
   cd "D:\\Kuliah\\Magang\\Mochint\\backend"

3. Jalankan server:
   node server.js
   
4. Tunggu sampai muncul:
   "🚀 Server running on http://localhost:5000"

5. Kembali ke halaman ini dan klik "Test Server"
`);
    
    // Buka terminal simulator
    window.open('http://localhost:5000', '_blank');
  };

  // Quick login untuk testing
  const handleQuickLogin = (type) => {
    if (type === 'member') {
      setEmail('siltiana@gmail.com');
      setPassword('labubu');
      setTimeout(() => {
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 100);
    } else if (type === 'admin') {
      setEmail('admin@mochint.com');
      setPassword('admin123');
      setTimeout(() => {
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans">
      {/* Container utama */}
      <div className="w-full max-w-md">
        
        {/* Server Status Banner */}
        <div className={`mb-6 p-3 rounded-lg ${serverStatus === 'online' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">
                {serverStatus === 'online' ? '✅ BACKEND ONLINE' : '⚠️ BACKEND OFFLINE'}
              </p>
              <p className="text-sm">
                {serverStatus === 'online' 
                  ? 'Server berjalan di port 5000' 
                  : 'Server tidak terdeteksi di port 5000'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTestServer}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Server
              </button>
              {serverStatus === 'offline' && (
                <button
                  onClick={handleStartBackend}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Backend
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#3E2723] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white font-bold text-4xl">M</span>
          </div>
          <h1 className="text-4xl font-bold text-[#3E2723] mb-2">MOCHINT</h1>
          <p className="text-sm font-black text-[#8D6E63] tracking-[0.4em] uppercase">BEAUTY CARE</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="mb-6">
          <p className="text-xs font-black text-[#8D6E63] mb-3 uppercase tracking-[0.1em]">
            Quick Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('member')}
              disabled={serverStatus === 'offline'}
              className={`py-3 text-sm font-bold rounded-lg transition-colors ${
                serverStatus === 'offline'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#A1887F] text-white hover:bg-[#8D6E63]'
              }`}
            >
              Login as Member
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={serverStatus === 'offline'}
              className={`py-3 text-sm font-bold rounded-lg transition-colors ${
                serverStatus === 'offline'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#3E2723] text-white hover:bg-[#5D4037]'
              }`}
            >
              Login as Admin
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm whitespace-pre-line">
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
              <input 
                type="password" 
                placeholder="**********" 
                required 
                value={password}
                className="w-full px-5 py-4 rounded-xl bg-[#FDFBF7] outline-none border-2 border-[#F0E6D6] focus:bg-white focus:border-[#8D6E63] focus:ring-0 transition-all text-[#3E2723] placeholder-[#A1887F] font-medium" 
                onChange={(e) => setPassword(e.target.value)} 
              />
              
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
              disabled={isLoading || serverStatus === 'offline'}
              className={`w-full py-4 font-bold rounded-xl shadow-lg mt-4 transition-all transform active:scale-[0.98] text-sm uppercase tracking-[0.1em] ${
                isLoading || serverStatus === 'offline'
                  ? 'bg-[#D7CCC8] text-[#8D6E63] cursor-not-allowed' 
                  : 'bg-[#3E2723] text-white hover:bg-[#5D4037] shadow-[#3E2723]/20'
              }`}
            >
              {isLoading ? "Memproses..." : serverStatus === 'offline' ? "SERVER OFFLINE" : "LOGIN TO ACCOUNT"}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-blue-800 mb-2">📋 Informasi:</p>
          <div className="text-[11px] text-blue-700 space-y-2">
            <div>
              <span className="font-bold">Server Status:</span> {serverStatus === 'online' ? '✅ Online' : '❌ Offline'}
            </div>
            <div>
              <span className="font-bold">API URL:</span> {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </div>
            <div>
              <span className="font-bold">Port Backend:</span> 5000
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={handleTestServer}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Test Server Connection
            </button>
            
            <button
              type="button"
              onClick={() => {
                console.log('🔍 Current localStorage:', {
                  token: localStorage.getItem('token'),
                  user: localStorage.getItem('user'),
                  user_type: localStorage.getItem('user_type')
                });
                alert('Check browser console for localStorage details');
              }}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"
            >
              Debug localStorage
            </button>
          </div>
        </div>

        {/* Footer Switch */}
        <p className="text-center text-sm text-[#A1887F] font-medium">
          Belum punya akun?{' '}
          <button 
            type="button"
            onClick={onSwitch} 
            className="text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors underline hover:no-underline"
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;