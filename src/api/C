import React, { useState } from 'react';
import { authAPI } from '../../api/client';
import { UserPlus, ShieldCheck } from 'lucide-react';

const Regist = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await authAPI.register(formData);
      if (res.success) {
        alert(`Pendaftaran Berhasil!\nID Member Anda: ${res.user.id}`);
        onSwitch(); 
      }
    } catch (error) {
      alert("Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 md:p-12 bg-white rounded-[45px] shadow-2xl font-sans text-[#3E2723]">
      {/* Header Logo - Menggunakan Poppins */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-[#3E2723] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          <span className="text-white font-display font-bold text-3xl">M</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-[#3E2723] tracking-tighter">MOCHINT</h2>
        <p className="text-[10px] text-[#8D6E63] tracking-[0.4em] uppercase font-black mt-1">Beauty Care</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
          <UserPlus size={18} className="text-[#8D6E63]" />
          <h3 className="text-xl font-display font-bold text-[#3E2723]">Buat Akun Member</h3>
      </div>

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
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
        </div>

        {/* Row 2: Nomor HP & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="text-left">
              <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Nomor HP</label>
              <input 
                type="text" 
                placeholder="+62 8xx" 
                required 
                className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="text-left">
              <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Password</label>
              <input 
                type="password" 
                placeholder="Min. 8 Karakter" 
                required 
                className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all font-medium placeholder:text-gray-300 shadow-sm"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
        </div>

        {/* Input Alamat */}
        <div className="text-left">
          <label className="block text-[10px] font-black text-[#A1887F] mb-2 uppercase tracking-widest font-sans">Alamat Lengkap</label>
          <textarea 
            placeholder="Tuliskan alamat pengiriman..." 
            required 
            rows="2"
            className="w-full px-5 py-3.5 rounded-2xl bg-[#FDFBF7] border-2 border-transparent focus:bg-white focus:border-[#8D6E63] outline-none text-sm transition-all resize-none font-medium placeholder:text-gray-300 shadow-sm"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          ></textarea>
        </div>

        <div className="flex items-start gap-3 bg-[#FDFBF7] p-4 rounded-2xl border border-gray-100">
            <ShieldCheck size={18} className="text-[#8D6E63] shrink-0" />
            <p className="text-[10px] text-[#A1887F] leading-relaxed font-medium font-sans">
              Dengan mendaftar, Anda menyetujui <span className="text-[#8D6E63] font-bold">Syarat & Ketentuan Layanan</span> serta Kebijakan Privasi Mochint Beauty Care.
            </p>
        </div>

        {/* Tombol Buat Akun - Poppins */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-5 bg-[#3E2723] text-white text-xs font-display font-bold rounded-[20px] shadow-xl hover:bg-[#8D6E63] shadow-[#3E2723]/20 active:scale-[0.97] transition-all disabled:opacity-50 mt-2 uppercase tracking-[0.2em]"
        >
          {isSubmitting ? "Processing..." : "Create Account"}
        </button>
      </form>

      {/* Footer Switch - Inter */}
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
  );
};

export default Regist;