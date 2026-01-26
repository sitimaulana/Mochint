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

      {/* --- POPUP EDIT PROFILE --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={handleCancel}></div>

          <div className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Popup */}
            <div className="bg-[#8D6E63] p-10 text-white relative text-center">
              <button onClick={handleCancel} className="absolute right-8 top-8 rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors">
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-white/20 rounded-[25px] mx-auto mb-4 flex items-center justify-center border-2 border-white/20">
                <Settings size={32} className="animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-serif font-bold italic">Update My Information</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-[0.2em] font-bold mt-1">ID: #{formData.id}</p>
            </div>

            {/* Form Body */}
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm font-bold outline-none focus:border-[#8D6E63] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm font-bold outline-none focus:border-[#8D6E63] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm font-bold outline-none focus:border-[#8D6E63] transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-10 flex gap-4">
              <button onClick={handleCancel} className="flex-1 rounded-2xl bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 rounded-2xl bg-[#8D6E63] px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-[#8D6E63]/30 hover:bg-[#5D4037] transition-all flex items-center justify-center gap-3">
                <Save size={18} /> Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Member;