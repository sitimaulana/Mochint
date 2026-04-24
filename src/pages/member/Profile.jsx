import React, { useState, useEffect } from 'react';
import { useMembers } from '../../context/MemberContext';
import { X, User, Mail, Phone, Save, Settings, Edit3, ShieldCheck } from 'lucide-react';

const Member = () => {
  const { updateMember } = useMembers();
  const [activeMember, setActiveMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Ambil data user yang sedang login saat ini
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('active_user'));
    if (user) {
      setActiveMember(user);
    }
  }, []);

  const handleEdit = () => {
    setFormData({ ...activeMember });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Nama wajib diisi'); return;
    }
    
    // 1. Update di Context/Backend
    updateMember(activeMember.id, { ...formData });
    
    // 2. Update di LocalStorage agar UI Navbar/Sidebar ikut berubah
    localStorage.setItem('active_user', JSON.stringify({ ...formData }));
    
    // 3. Update State Lokal
    setActiveMember({ ...formData });
    setIsEditing(false);
    
    alert('Profil berhasil diperbarui!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!activeMember) return <div className="p-10 text-center">Memuat data profil...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 font-sans text-gray-800 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5D4037] tracking-tight">My Profile</h1>
          <p className="text-gray-400 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Mochint Personal Account</p>
        </div>
        <button 
          onClick={handleEdit} 
          className="bg-[#8D6E63] text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all w-fit"
        >
           <Edit3 size={16}/> Edit Profile
        </button>
      </div>

      {/* TAMPILAN KARTU PROFIL TUNGGAL */}
      <div className="max-w-4xl bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sisi Kiri: Foto/Icon */}
          <div className="bg-[#FDFBF7] p-12 flex flex-col items-center justify-center border-r border-gray-50">
            <div className="w-32 h-32 bg-[#8D6E63]/10 rounded-[40px] flex items-center justify-center text-[#8D6E63] border-4 border-white shadow-inner mb-4">
              <User size={60} />
            </div>
            <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> {activeMember.status || 'Active'}
            </span>
          </div>

          {/* Sisi Kanan: Detail Data */}
          <div className="p-12 flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member ID</p>
              <p className="text-lg font-bold text-[#5D4037]">#{activeMember.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
              <p className="text-lg font-bold text-[#5D4037]">{activeMember.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
              <p className="text-lg font-bold text-[#5D4037]">{activeMember.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
              <p className="text-lg font-bold text-[#5D4037]">{activeMember.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL - CENTERED --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#8D6E63] px-6 sm:px-8 py-5 sm:py-6 text-white relative flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <Settings size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-display font-bold tracking-tight">
                    Update My Information
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 font-sans">
                    Member ID: #{formData.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCancel} 
                className="opacity-70 hover:opacity-100 transition-opacity bg-white/10 rounded-full p-2 hover:bg-white/20"
              >
                <X size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            
            {/* Form Body */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all"
                  />
                </div>
                
                {/* Info Box */}
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
                  <div className="text-blue-600 shrink-0 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs text-blue-800 font-medium font-sans leading-relaxed">
                    Pastikan informasi akurat untuk layanan yang lebih baik.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer - Action Buttons */}
            <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-5 flex gap-3 sm:gap-4 rounded-b-2xl sm:rounded-b-3xl border-t border-gray-200">
              <button 
                onClick={handleCancel}
                className="flex-1 max-w-[140px] py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#8D6E63] hover:bg-gray-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 sm:py-3 bg-[#8D6E63] text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={14} className="sm:w-4 sm:h-4"/> Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Member;