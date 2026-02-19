import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MessageCircle, Clock, ChevronRight, LogOut, Award, X, Save, Settings, Star, Send, Loader2 } from 'lucide-react';
import { reviewsAPI, membersAPI } from '../../api/client';
import { memberAPI, appointmentAPI } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // State untuk Popup Update Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // State untuk Fitur Review
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // State untuk Appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Coba ambil dari active_user dulu, lalu user sebagai fallback
        const activeUserStr = localStorage.getItem('active_user');
        const userStr = localStorage.getItem('user');
        
        let userData = null;
        
        if (activeUserStr) {
          userData = JSON.parse(activeUserStr);
        } else if (userStr) {
          userData = JSON.parse(userStr);
          // Simpan sebagai active_user untuk konsistensi
          localStorage.setItem('active_user', userStr);
        }
        
        if (!userData || !userData.id) {
          console.warn('No user data found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log('📝 Loading user from localStorage:', userData.id);
        
        try {
          // Fetch fresh data from backend
          const response = await membersAPI.getAll();
          
          if (response.data && response.data.success) {
            // Find current user from backend data
            const backendUser = response.data.data.find(m => m.id === userData.id);
            
            if (backendUser) {
              // Merge backend data with localStorage (keep role from localStorage)
              const mergedUser = {
                id: backendUser.id,
                name: backendUser.name,
                email: backendUser.email,
                phone: backendUser.phone,
                address: backendUser.address,
                role: userData.role || 'member'
              };
              
              console.log('✅ User data loaded from backend:', mergedUser);
              
              // Update localStorage with fresh data
              localStorage.setItem('active_user', JSON.stringify(mergedUser));
              
              // PENTING: Set user state dan formData dengan data lengkap
              setUser(mergedUser);
              setFormData({
                id: mergedUser.id,
                name: mergedUser.name || '',
                email: mergedUser.email || '',
                phone: mergedUser.phone || '',
                address: mergedUser.address || '',
                role: mergedUser.role
              });
            } else {
              // Backend data not found, use localStorage
              console.warn('⚠️ User not found in backend, using localStorage');
              setUser(userData);
              setFormData({
                id: userData.id,
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || '',
                role: userData.role
              });
            }
          } else {
            // Backend error, use localStorage
            console.warn('⚠️ Backend error, using localStorage');
            setUser(userData);
            setFormData({
              id: userData.id,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              role: userData.role
            });
          }
        } catch (backendError) {
          // Backend unreachable, use localStorage
          console.warn('⚠️ Cannot connect to backend, using localStorage:', backendError.message);
          setUser(userData);
          setFormData({
            id: userData.id,
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            role: userData.role
          });
        }
        
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);
  
  // Load upcoming appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoadingAppointments(true);
        console.log('📅 Loading appointments for member:', user.id);
        
        const response = await appointmentAPI.getByMember(user.id);
        
        if (response.data && response.data.success) {
          const appointments = response.data.data;
          
          // Filter only confirmed appointments that are upcoming (today or future)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = appointments.filter(apt => {
            if (apt.status !== 'confirmed') return false;
            
            const aptDate = new Date(apt.date);
            return aptDate >= today;
          }).sort((a, b) => {
            // Sort by date, then by time
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          }).slice(0, 3); // Take first 3 upcoming appointments
          
          console.log('✅ Found', upcoming.length, 'upcoming appointments');
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error('❌ Error loading appointments:', error);
        // Don't show error to user, just set empty array
        setUpcomingAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };
    
    loadAppointments();
  }, [user]);

  const handleLogout = () => {
    console.log('Logging out user:', user?.email);
    
    // Clear semua auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_user');
    localStorage.removeItem('isAdmin');
    
    // Navigate ke home
    navigate('/');
    
    // Optional: reload untuk reset state aplikasi
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Nama wajib diisi');
      return;
    }
    
    if (!formData.email?.trim()) {
      alert('Email wajib diisi');
      return;
    }
    
    console.log('📝 Saving profile update:', formData);
    
    try {
      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || ''
      };
      
      console.log('Update payload:', updateData);
      
      // 1. Update to backend database
      try {
        const response = await memberAPI.update(formData.id, updateData);
        
        if (response.data && response.data.success) {
          console.log('✅ Profile updated in backend:', response.data);
        }
      } catch (backendError) {
        console.warn('⚠️ Backend update failed:', backendError.message);
        // Lanjutkan dengan localStorage update
      }
      
      // 2. Prepare updated user object
      const updatedUser = {
        id: formData.id,
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        address: updateData.address,
        role: formData.role || user.role || 'member'
      };
      
      console.log('Updated user object:', updatedUser);
      
      // 3. Update active_user di localStorage
      localStorage.setItem('active_user', JSON.stringify(updatedUser));
      
      // 4. Update user data juga (untuk konsistensi)
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 5. Update database lokal (mochint_users) jika ada
      try {
        const allUsers = JSON.parse(localStorage.getItem('mochint_users')) || [];
        if (allUsers.length > 0) {
          const updatedUsers = allUsers.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          );
          localStorage.setItem('mochint_users', JSON.stringify(updatedUsers));
          console.log('✅ Updated mochint_users localStorage');
        }
      } catch (e) {
        console.warn('mochint_users update skipped');
      }
      
      // 6. Update state
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditModalOpen(false);
      
      alert('✅ Profil berhasil diperbarui!');
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('❌ Gagal menyimpan profil. Silakan coba lagi.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment.trim()) {
      alert("Silakan tulis pesan Anda terlebih dahulu");
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('active_user')) || user;
      
      console.log('Submitting review for user:', currentUser.name);
      
      // HANYA kirim userId, rating, comment
      // Name dan location akan diambil dari table members via JOIN
      const reviewPayload = {
        userId: currentUser.id,  // HANYA userId
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      };
      
      console.log('Review payload:', reviewPayload);
      
      const response = await reviewsAPI.create(reviewPayload);
      
      console.log('✅ Review submitted successfully:', response);
      
      alert("✅ Terima kasih atas ulasan Anda! Review Anda akan segera muncul di halaman utama.");
      
      // Reset form
      setReviewData({ rating: 5, comment: '' });
      
      // Refresh page setelah 1.5 detik
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      
      if (error.response) {
        console.error('Response error:', error.response);
        alert(`❌ Gagal mengirim ulasan: ${error.response.message || 'Server error'}`);
      } else if (error.message) {
        alert(`❌ Gagal mengirim ulasan: ${error.message}`);
      } else {
        alert("❌ Gagal mengirim ulasan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8D6E63] mx-auto mb-4" size={48} />
          <p className="mt-4 text-gray-600 font-sans font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 font-sans text-[#5D4037]">
      <div className="container mx-auto px-4 sm:px-6 pt-8 md:pt-10">
        
        {/* HEADER DASHBOARD */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-[#5D4037] tracking-tighter leading-tight">
            Mochint Beauty Care
          </h1>
          <p className="text-[#8D6E63] font-bold font-sans uppercase text-xs tracking-widest mt-1">
            Layanan Member 
          </p>
          <p className="text-sm text-gray-400 mt-1 italic font-sans opacity-70">
            Layanan Istimewa untuk Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* KOLOM KIRI: KARTU PROFIL & PENGINGAT */}
          <div className="lg:col-span-1 space-y-6 text-left">
            
            {/* KARTU PROFIL */}
            <div className="bg-[#8D6E63] rounded-3xl md:rounded-[30px] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <User size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-black font-sans">
                      {user.role === 'admin' ? 'Admin' : 'Member'} {user.role === 'premium_member' ? 'Premium' : ''}
                    </p>
                    <h2 className="text-lg md:text-xl font-display font-bold truncate tracking-tight">
                      {user.name}
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm border-t border-white/20 pt-6 font-sans">
                  <div className="flex justify-between">
                    <span className="opacity-70">ID Member</span>
                    <span className="font-mono font-bold tracking-wider">
                      {user.id || 'T/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">No. HP</span>
                    <span>{user.phone || 'Belum diatur'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Email</span>
                    <span className="truncate max-w-[140px] md:max-w-[160px] text-right">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="opacity-70 shrink-0">Alamat</span>
                    <span className="text-right text-[11px] leading-relaxed italic opacity-90 flex-1">
                      {user.address || 'Alamat belum diatur'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all"
                >
                  Edit Profil
                </button>
              </div>
            </div>

            {/* BAGIAN PENGINGAT */}
            <div className="bg-white rounded-3xl md:rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-[#5D4037]">Pengingat Appointment</h3>
                {upcomingAppointments.length > 0 && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-black uppercase tracking-widest font-sans">
                    {upcomingAppointments.length} Aktif
                  </span>
                )}
              </div>
              
              {loadingAppointments ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="animate-spin text-[#8D6E63]" size={24} />
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => {
                    const aptDate = new Date(appointment.date);
                    const formattedDate = aptDate.toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    });
                    
                    return (
                      <div 
                        key={appointment.id}
                        className="flex items-start gap-4 p-4 bg-[#FDFBF7] rounded-2xl border border-[#F5F1EE] hover:border-[#8D6E63]/30 transition-all cursor-pointer"
                        onClick={() => navigate(`/member/appointment/${appointment.id}`)}
                      >
                        <div className="bg-[#8D6E63]/10 p-3 rounded-xl text-[#8D6E63] shrink-0">
                          <Clock size={20} />
                        </div>
                        <div className="font-sans flex-1">
                          <p className="text-sm font-bold text-[#5D4037]">
                            {appointment.treatment_name || 'Treatment'}
                          </p>
                          <p className="text-xs text-gray-500">{formattedDate}</p>
                          <p className="text-xs text-[#8D6E63] font-black mt-1">
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button
                    onClick={() => navigate('/member/appointment')}
                    className="w-full mt-2 py-2 text-xs font-bold text-[#8D6E63] hover:bg-[#8D6E63]/5 rounded-xl transition-all"
                  >
                    Lihat Semua Appointment →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-sans mb-3">
                    Belum ada appointment terjadwal
                  </p>
                  <button
                    onClick={() => navigate('/member/booking/step-1')}
                    className="px-4 py-2 bg-[#8D6E63] text-white text-xs font-bold rounded-xl hover:bg-[#5D4037] transition-all"
                  >
                    Buat Appointment Baru
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-red-400 font-display font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all border border-dashed border-red-100"
            >
              <LogOut size={18} /> Keluar Akun
            </button>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={() => navigate('/member/booking/step-1')} 
                className="group bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="bg-[#8D6E63] w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-display font-bold text-[#5D4037]">
                  Pemesanan Online
                </h3>
                <div className="mt-4 flex items-center text-[#8D6E63] font-display font-bold text-xs uppercase tracking-widest">
                  Mulai Pemesanan <ChevronRight size={18} className="ml-1" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/member/appointment')} 
                className="group bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="bg-[#8D6E63] w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-display font-bold text-[#5D4037]">
                  Janji Temu
                </h3>
                <div className="mt-4 flex items-center text-[#5D4037] font-display font-bold text-xs uppercase tracking-widest">
                  Lihat Jadwal <ChevronRight size={18} className="ml-1" />
                </div>
              </div>
            </div>

            {/* KONSULTASI WHATSAPP */}
            <div 
              onClick={() => window.open('https://wa.me/+6281994204009', '_blank')} 
              className="group bg-white p-6 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="bg-green-500 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-display font-bold text-[#5D4037]">
                      Konsultasi WhatsApp
                    </h3>
                    <p className="text-sm text-[#A1887F] font-sans font-medium mt-1">
                      Layanan bantuan langsung dari admin kami.
                    </p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-300 group-hover:text-[#8D6E63] transition-colors hidden md:block" />
              </div>
            </div>

            {/* FITUR ULASAN */}
            <div className="bg-white rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="bg-[#F9F6F2] p-6 md:p-10 md:w-1/3 flex flex-col justify-center">
                <div className="bg-[#8D6E63]/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-[#8D6E63] mx-auto md:mx-0">
                  <Star size={24} fill="currentColor" />
                </div>
                <h3 className="text-lg md:text-xl font-display font-bold mb-2 tracking-tight text-center md:text-left">
                  Ulasan Saya
                </h3>
                <p className="text-xs text-[#A1887F] font-sans leading-relaxed text-center md:text-left">
                  Berikan rating dan ulasan Anda untuk kami.
                </p>
              </div>
              <div className="p-6 md:p-10 flex-1 bg-white">
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex gap-2 justify-center md:justify-start">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          fill={star <= reviewData.rating ? "#FACC15" : "none"} 
                          className={star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"} 
                        />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    rows="2" 
                    value={reviewData.comment} 
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Ceritakan pengalaman Anda di sini..." 
                    className="w-full bg-[#FDFBF7] p-4 rounded-2xl border border-transparent focus:border-[#8D6E63] outline-none text-sm font-sans transition-all font-medium"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-4 bg-[#8D6E63] text-white font-display font-bold rounded-2xl text-[11px] uppercase tracking-widest hover:bg-[#5D4037] transition-all flex items-center justify-center gap-3 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? (
                      "Memproses..."
                    ) : (
                      <>
                        <Send size={16} /> Publikasikan Ulasan
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP: PERBARUI INFORMASI SAYA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in" 
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#8D6E63] p-8 md:p-10 text-white text-center relative">
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="absolute right-6 top-6 md:right-8 md:top-8 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={20}/>
              </button>
              <div className="w-14 h-14 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/20">
                <Settings size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold italic tracking-tight">
                Perbarui Profil
              </h3>
            </div>
            <div className="p-6 md:p-10 space-y-5 text-left font-sans text-[#3E2723]">
              <div>
                <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" 
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">
                  Nomor Telepon
                </label>
                <input 
                  type="tel" 
                  value={formData.phone || ''} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">
                  Alamat Email
                </label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold" 
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#A1887F] uppercase tracking-widest block mb-1">
                  Alamat
                </label>
                <textarea 
                  value={formData.address || ''} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  className="w-full bg-[#FDFBF7] px-6 py-3 rounded-2xl outline-none border border-transparent focus:border-[#8D6E63] text-sm font-bold resize-none" 
                  rows="2" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 py-4 bg-gray-50 rounded-2xl font-display font-bold text-[10px] uppercase tracking-widest text-[#A1887F]"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-4 bg-[#8D6E63] text-white rounded-2xl font-display font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all flex items-center justify-center"
                >
                  <Save size={16} className="mr-2"/> Simpan Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;