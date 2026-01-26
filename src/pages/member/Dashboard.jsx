import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MessageCircle, Clock, ChevronRight, LogOut, Award, X, Save, Settings, Star, Send } from 'lucide-react';
import { postReview } from '../../api/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // State untuk Popup Update Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // State untuk Fitur Review
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem('active_user'));
    if (!activeUser) {
      navigate('/member-app');
    } else {
      setUser(activeUser);
      setFormData(activeUser); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('active_user');
    navigate('/');
  };

  const handleSave = () => {
    if (!formData.name?.trim()) return alert('Nama wajib diisi');
    
    // 1. Update sesi aktif
    localStorage.setItem('active_user', JSON.stringify(formData));
    
    // 2. Update database lokal (mochint_users) agar perubahan permanen
    const allUsers = JSON.parse(localStorage.getItem('mochint_users')) || [];
    const updatedUsers = allUsers.map(u => u.id === formData.id ? formData : u);
    localStorage.setItem('mochint_users', JSON.stringify(updatedUsers));

    setUser(formData);
    setIsEditModalOpen(false);
    alert('Profil berhasil diperbarui!');
  };

  const handleSubmitReview = async (e) => {
  e.preventDefault();
  if (!reviewData.comment.trim()) return alert("Silakan tulis pesan Anda");
  
  setIsSubmittingReview(true);
  try {
    // KITA AMBIL DATA TERBARU DARI LOCALSTORAGE SEBELUM KIRIM
    const currentUser = JSON.parse(localStorage.getItem('active_user'));

    await postReview({
      name: currentUser.name,
      location: currentUser.address || "Verified Member", // Ambil alamat terbaru
      rating: reviewData.rating,
      comment: reviewData.comment
    });

    alert("Terima kasih!.");
    setReviewData({ rating: 5, comment: '' });
  } catch (error) {
    alert("Gagal mengirim review.");
  } finally {
    setIsSubmittingReview(false);
  }
};
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-6 pt-10">
        
        {/* HEADER DASHBOARD */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#5D4037] tracking-tighter leading-tight">Mochint Dashboard</h1>
          <p className="text-[#8D6E63] font-bold font-sans uppercase text-xs tracking-widest mt-1">Member Services</p>
          <p className="text-sm text-gray-400 mt-1 italic font-sans opacity-70">Layanan Istimewa untuk Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: PROFILE CARD & REMINDER */}
          <div className="lg:col-span-1 space-y-6 text-left">
            
            {/* PROFILE CARD */}
            <div className="bg-[#8D6E63] rounded-[30px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-black font-sans">Member Premium</p>
                    <h2 className="text-xl font-display font-bold truncate w-40 tracking-tight">{user.name}</h2>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm border-t border-white/20 pt-6 font-sans">
                  <div className="flex justify-between">
                    <span className="opacity-70">ID Member</span>
                    <span className="font-mono font-bold tracking-wider">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">No. HP</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Email</span>
                    <span className="truncate w-32 text-right">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="opacity-70 shrink-0">Alamat</span>
                    <span className="text-right text-[11px] leading-relaxed italic opacity-90">{user.address || 'Alamat belum diatur'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* REMINDER SECTION */}
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-[#5D4037]">Reminder</h3>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black uppercase tracking-widest font-sans">Confirmed</span>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-[#FDFBF7] rounded-2xl border border-[#F5F1EE]">
                <div className="bg-[#8D6E63]/10 p-3 rounded-xl text-[#8D6E63]">
                  <Clock size={20} />
                </div>
                <div className="font-sans">
                  <p className="text-sm font-bold text-[#5D4037]">Facial Detox</p>
                  <p className="text-xs text-gray-500">Kamis, 1 Januari 2026</p>
                  <p className="text-xs text-[#8D6E63] font-black mt-1">10:00 AM</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-red-400 font-display font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all border border-dashed border-red-100"
            >
              <LogOut size={18} /> Logout Account
            </button>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => navigate('/member/booking/step-1')} className="group bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer">
                <div className="bg-[#8D6E63] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-display font-bold text-[#5D4037]">Online Booking</h3>
                <div className="mt-4 flex items-center text-[#8D6E63] font-display font-bold text-xs uppercase tracking-widest">
                  Mulai Booking <ChevronRight size={18} className="ml-1" />
                </div>
              </div>

              <div onClick={() => navigate('/member/appointment')} className="group bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer">
                <div className="bg-[#5D4037] w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={28} />
                </div>
                <h3 className="text-xl font-display font-bold text-[#5D4037]">Appointment</h3>
                <div className="mt-4 flex items-center text-[#5D4037] font-display font-bold text-xs uppercase tracking-widest">
                  Lihat Jadwal <ChevronRight size={18} className="ml-1" />
                </div>
              </div>
            </div>

            {/* KONSULTASI WHATSAPP */}
            <div onClick={() => window.open('https://wa.me/6281234567890', '_blank')} className="group bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg">
                    <MessageCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#5D4037]">Konsultasi WhatsApp</h3>
                    <p className="text-sm text-[#A1887F] font-sans font-medium mt-1">Layanan bantuan langsung dari admin kami.</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-300 group-hover:text-[#8D6E63] transition-colors" />
              </div>
            </div>

            {/* FITUR REVIEW */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-[#F9F6F2] p-10 md:w-1/3 flex flex-col justify-center">
                    <div className="bg-[#8D6E63]/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-[#8D6E63] mx-auto md:mx-0">
                        <Star size={24} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2 tracking-tight text-center md:text-left">My Review</h3>
                    <p className="text-xs text-[#A1887F] font-sans leading-relaxed text-center md:text-left">Berikan rating dan ulasan Anda untuk kami.</p>
                </div>
                <div className="p-10 flex-1 bg-white">
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex gap-2 justify-center md:justify-start">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setReviewData({...reviewData, rating: star})}>
                                    <Star size={24} fill={star <= reviewData.rating ? "#FACC15" : "none"} className={star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            rows="2" 
                            value={reviewData.comment} 
                            onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                            placeholder="Ceritakan pengalaman Anda di sini..." 
                            className="w-full bg-[#FDFBF7] p-4 rounded-2xl border border-transparent focus:border-[#8D6E63] outline-none text-sm font-sans transition-all font-medium"
                        />
                        <button 
                            disabled={isSubmittingReview}
                            className="w-full py-4 bg-[#8D6E63] text-white font-display font-bold rounded-2xl text-[11px] uppercase tracking-widest hover:bg-[#5D4037] transition-all flex items-center justify-center gap-3 shadow-md active:scale-95"
                        >
                            {isSubmittingReview ? "Processing..." : <><Send size={16} /> Publish Review</>}
                        </button>
                    </form>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* POPUP: UPDATE MY INFORMATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-[#8D6E63] p-10 text-white text-center">
                <button onClick={() => setIsEditModalOpen(false)} className="absolute right-8 top-8 opacity-50 hover:opacity-100 transition-opacity"><X size={20}/></button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20"><Settings size={28}/></div>
                <h3 className="text-2xl font-display font-bold italic tracking-tight">Update Profile</h3>
             </div>
             <div className="p-10 space-y-5 text-left font-sans text-[#3E2723]">
                <div>
                    <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">Full Name</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">Phone Number</label>
                    <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">Email Address</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" />
                </div>
                <div>
                    <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">Address</label>
                    <textarea value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold resize-none" rows="2" />
                </div>
                <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-gray-50 rounded-2xl font-display font-bold text-[10px] uppercase tracking-widest text-[#A1887F]">Cancel</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-[#8D6E63] text-white rounded-2xl font-display font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all"><Save size={16} className="inline mr-2"/> Save Profile</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;