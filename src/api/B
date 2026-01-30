import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/client';

const Login = ({ onSwitch, onForgot }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authAPI.login(email, password);
      // Sukses login langsung arahkan ke Dashboard Member
      navigate('/member'); 
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-10 bg-white font-sans text-[#3E2723]">
      {/* Logo Section - Menggunakan Poppins */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-[#3E2723] tracking-tighter">MOCHINT</h2>
        <p className="text-[10px] text-[#8D6E63] tracking-[0.4em] uppercase font-black mt-1">Beauty Care</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 text-left">
        {/* Input Email - Menggunakan Inter */}
        <div>
          <label className="text-[10px] font-black text-[#A1887F] mb-2 block uppercase tracking-widest font-sans">Email Address</label>
          <input 
            type="email" 
            name="email" 
            placeholder="username@gmail.com" 
            required 
            className="w-full px-5 py-4 rounded-2xl bg-[#FDFBF7] outline-none border-2 border-transparent focus:bg-white focus:border-[#8D6E63] transition-all text-sm font-sans font-medium placeholder:text-gray-300 shadow-sm" 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        {/* Input Password - Menggunakan Inter */}
        <div>
          <label className="text-[10px] font-black text-[#A1887F] mb-2 block uppercase tracking-widest font-sans">Password</label>
          <input 
            type="password" 
            name="password" 
            placeholder="**********" 
            required 
            className="w-full px-5 py-4 rounded-2xl bg-[#FDFBF7] outline-none border-2 border-transparent focus:bg-white focus:border-[#8D6E63] transition-all text-sm font-sans font-medium placeholder:text-gray-300 shadow-sm" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          {/* Fitur Lupa Password */}
          <div className="text-right mt-3">
            <button 
              type="button" 
              onClick={onForgot} 
              className="text-[11px] text-[#8D6E63] hover:text-[#3E2723] font-bold transition-colors uppercase tracking-tight"
            >
              Lupa Password?
            </button>
          </div>
        </div>

        {/* Tombol Login - Menggunakan Poppins */}
        <button 
          disabled={isLoading}
          className={`w-full py-5 font-display font-bold rounded-[20px] shadow-xl mt-6 transition-all transform active:scale-[0.97] text-xs uppercase tracking-[0.2em] ${
            isLoading 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-[#3E2723] text-white hover:bg-[#8D6E63] shadow-[#3E2723]/20'
          }`}
        >
          {isLoading ? "Authenticating..." : "Login to Account"}
        </button>
      </form>

      {/* Footer Switch - Menggunakan Inter */}
      <p className="text-center mt-10 text-[13px] text-gray-400 font-medium font-sans">
        Belum punya akun?{' '}
        <button 
          type="button"
          onClick={onSwitch} 
          className="text-[#8D6E63] font-bold hover:text-[#3E2723] transition-colors border-b border-[#8D6E63]/20 hover:border-[#3E2723]"
        >
          Daftar sekarang
        </button>
      </p>
    </div>
  );
};

export default Login;