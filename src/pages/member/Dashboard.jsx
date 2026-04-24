import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MessageCircle, Clock, ChevronRight, Award, X, Save, Settings, Star, Send, Loader2 } from 'lucide-react';
import { reviewsAPI } from '../../api/client';
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

  // State untuk Notification
  const [notification, setNotification] = useState({ 
    show: false, 
    type: '', 
    title: '', 
    message: '' 
  });

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
          const response = await memberAPI.getAll();
          
          if (response.data && response.data.success) {
            // Find current user from backend data
            const backendUser = response.data.data.find(m => m.id === userData.id);
            
            if (backendUser) {
              // Merge backend data with localStorage (keep role from localStorage)
              const mergedUser = {
                ...backendUser,
                role: userData.role || 'member'
              };
              
              console.log('✅ User data loaded from backend:', mergedUser);
              
              // Update localStorage with fresh data
              localStorage.setItem('active_user', JSON.stringify(mergedUser));
              
              setUser(mergedUser);
              setFormData(mergedUser);
              
              // Check if profile is incomplete (phone or address missing)
              if (!mergedUser.phone || !mergedUser.address || mergedUser.phone.trim() === '' || mergedUser.address.trim() === '') {
                console.log('⚠️ Profile incomplete, opening edit modal');
                // Open modal after a short delay
                setTimeout(() => {
                  setIsEditModalOpen(true);
                  setNotification({
                    show: true,
                    type: 'error',
                    title: 'Profil Belum Lengkap',
                    message: 'Silakan lengkapi nomor telepon dan alamat Anda'
                  });
                }, 500);
              }
            } else {
              // Backend data not found, use localStorage
              console.warn('⚠️ User not found in backend, using localStorage');
              setUser(userData);
              setFormData(userData);
              
              // Check if profile is incomplete
              if (!userData.phone || !userData.address || userData.phone.trim() === '' || userData.address.trim() === '') {
                setTimeout(() => {
                  setIsEditModalOpen(true);
                  setNotification({
                    show: true,
                    type: 'error',
                    title: 'Profil Belum Lengkap',
                    message: 'Silakan lengkapi nomor telepon dan alamat Anda'
                  });
                }, 500);
              }
            }
          } else {
            // Backend error, use localStorage
            console.warn('⚠️ Backend error, using localStorage');
            setUser(userData);
            setFormData(userData);
            
            // Check if profile is incomplete
            if (!userData.phone || !userData.address || userData.phone.trim() === '' || userData.address.trim() === '') {
              setTimeout(() => {
                setIsEditModalOpen(true);
                setNotification({
                  show: true,
                  type: 'error',
                  title: 'Profil Belum Lengkap',
                  message: 'Silakan lengkapi nomor telepon dan alamat Anda'
                });
              }, 500);
            }
          }
        } catch (backendError) {
          // Backend unreachable, use localStorage
          console.warn('⚠️ Cannot connect to backend, using localStorage:', backendError.message);
          setUser(userData);
          setFormData(userData);
          
          // Check if profile is incomplete
          if (!userData.phone || !userData.address || userData.phone.trim() === '' || userData.address.trim() === '') {
            setTimeout(() => {
              setIsEditModalOpen(true);
              setNotification({
                show: true,
                type: 'error',
                title: 'Profil Belum Lengkap',
                message: 'Silakan lengkapi nomor telepon dan alamat Anda'
              });
            }, 500);
          }
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

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama wajib diisi'
      });
      return;
    }
    
    if (!formData.phone?.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nomor telepon wajib diisi'
      });
      return;
    }
    
    if (!formData.address?.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Alamat wajib diisi'
      });
      return;
    }
    
    console.log('📝 Saving profile update:', formData);
    
    try {
      // 1. Update to backend database
      let backendSuccess = false;
      try {
        console.log('📤 Sending update to backend for member ID:', formData.id);
        const response = await memberAPI.update(formData.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        });
        
        console.log('📥 Backend response:', response.data);
        
        if (response.data && response.data.success) {
          console.log('✅ Profile updated in backend database');
          backendSuccess = true;
        } else {
          console.warn('⚠️ Backend returned non-success:', response.data);
        }
      } catch (backendError) {
        console.error('❌ Backend update failed:', backendError);
        console.error('Error details:', backendError.response?.data || backendError.message);
      }
      
      // 2. Update localStorage (always update, even if backend fails)
      const updatedUser = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };
      
      localStorage.setItem('active_user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3. Update database lokal (mochint_users) jika ada
      const allUsers = JSON.parse(localStorage.getItem('mochint_users')) || [];
      if (allUsers.length > 0) {
        const updatedUsers = allUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        localStorage.setItem('mochint_users', JSON.stringify(updatedUsers));
      }
      
      // 4. Update state
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditModalOpen(false);
      
      // Show appropriate notification
      if (backendSuccess) {
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Profil berhasil diperbarui dan tersinkronisasi dengan database'
        });
      } else {
        setNotification({
          show: true,
          type: 'success',
          title: 'Tersimpan Lokal',
          message: 'Profil tersimpan. Koneksi database mungkin terputus.'
        });
      }
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Gagal menyimpan profil. Silakan coba lagi.'
      });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Silakan tulis pesan Anda terlebih dahulu'
      });
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      // Ambil data user terbaru dari localStorage
      const currentUser = JSON.parse(localStorage.getItem('active_user')) || user;
      
      console.log('Submitting review with user:', currentUser.name);
      
      // Pastikan data yang dikirim sesuai dengan struktur yang diharapkan backend
      const reviewPayload = {
        name: currentUser.name || 'Member Mochint',
        location: currentUser.address || "Pelanggan Setia Mochint",
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        userId: currentUser.id,
        email: currentUser.email
      };
      
      console.log('Review payload:', reviewPayload);
      
      // Gunakan reviewsAPI.create()
      const response = await reviewsAPI.create(reviewPayload);
      
      console.log('Review submitted successfully:', response.data);
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Terima Kasih!',
        message: 'Ulasan Anda berhasil dikirim dan akan segera muncul di halaman utama'
      });
      
      // Reset form
      setReviewData({ rating: 5, comment: '' });
      
      // Optional: Refresh page setelah 2 detik
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      let errorMessage = 'Gagal mengirim ulasan. Silakan coba lagi.';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        errorMessage = error.response.data.message || 'Server error';
      } else if (error.request) {
        console.error('Request error:', error.request);
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Mengirim',
        message: errorMessage
      });
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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-6 sm:pt-8 md:pt-10">
        
        {/* HEADER DASHBOARD */}
        <div className="mb-6 sm:mb-8 text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-[#5D4037] tracking-tighter leading-tight">
            Mochint Beauty Care
          </h1>
          <p className="text-[#8D6E63] font-bold font-sans uppercase text-[10px] sm:text-xs tracking-widest mt-1">
            Layanan Member 
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 italic font-sans opacity-70">
            Layanan Istimewa untuk Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          
          {/* KOLOM KIRI: KARTU PROFIL & PENGINGAT */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 text-left">
            
            {/* KARTU PROFIL */}
            <div className="bg-[#8D6E63] rounded-2xl sm:rounded-3xl md:rounded-[30px] p-5 sm:p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                    <User size={22} className="sm:w-[26px] sm:h-[26px] md:w-[28px] md:h-[28px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] sm:text-[10px] opacity-80 uppercase tracking-widest font-black font-sans">
                      {user.role === 'admin' ? 'Admin' : 'Member'} {user.role === 'premium_member' ? 'Premium' : ''}
                    </p>
                    <h2 className="text-base sm:text-lg md:text-xl font-display font-bold truncate tracking-tight">
                      {user.name}
                    </h2>
                  </div>
                </div>
                
                <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm border-t border-white/20 pt-4 sm:pt-5 md:pt-6 font-sans">
                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 text-[11px] sm:text-xs">ID Member</span>
                    <span className="font-mono font-bold tracking-wider text-[11px] sm:text-xs">
                      {user.id || 'T/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 text-[11px] sm:text-xs">No. HP</span>
                    <span className="text-[11px] sm:text-xs">{user.phone || 'Belum diatur'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 text-[11px] sm:text-xs">Email</span>
                    <span className="truncate max-w-[120px] sm:max-w-[140px] md:max-w-[160px] text-right text-[11px] sm:text-xs">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="opacity-70 shrink-0 text-[11px] sm:text-xs">Alamat</span>
                    <span className="text-right text-[10px] sm:text-[11px] leading-relaxed italic opacity-90 flex-1">
                      {user.address || 'Alamat belum diatur'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-4 sm:mt-5 md:mt-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-[10px] sm:text-xs font-display font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  Edit Profil
                </button>
              </div>
            </div>

            {/* BAGIAN PENGINGAT */}
            <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[30px] p-4 sm:p-5 md:p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#5D4037]">Pengingat Appointment</h3>
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
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#FDFBF7] rounded-xl sm:rounded-2xl border border-[#F5F1EE] hover:border-[#8D6E63]/30 transition-all cursor-pointer active:scale-95"
                        onClick={() => navigate(`/member/appointment/${appointment.id}`)}
                      >
                        <div className="bg-[#8D6E63]/10 p-2 sm:p-3 rounded-lg sm:rounded-xl text-[#8D6E63] shrink-0">
                          <Clock size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="font-sans flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[#5D4037] truncate">
                            {appointment.treatment_name || 'Treatment'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{formattedDate}</p>
                          <p className="text-[10px] sm:text-xs text-[#8D6E63] font-black mt-0.5 sm:mt-1">
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button
                    onClick={() => navigate('/member/appointment')}
                    className="w-full mt-2 py-2 text-[10px] sm:text-xs font-bold text-[#8D6E63] hover:bg-[#8D6E63]/5 rounded-xl transition-all active:scale-95"
                  >
                    Lihat Semua Appointment →
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="bg-gray-100 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Calendar size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 font-sans mb-3 px-2">
                    Belum ada appointment terjadwal
                  </p>
                  <button
                    onClick={() => navigate('/member/booking/step-1')}
                    className="px-3 sm:px-4 py-2 bg-[#8D6E63] text-white text-[10px] sm:text-xs font-bold rounded-xl hover:bg-[#5D4037] transition-all active:scale-95"
                  >
                    Buat Appointment Baru
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div 
                onClick={() => navigate('/member/booking/step-1')} 
                className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <div className="bg-[#8D6E63] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                  <Calendar size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#5D4037]">
                  Pemesanan Online
                </h3>
                <div className="mt-3 sm:mt-4 flex items-center text-[#8D6E63] font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                  Mulai Pemesanan <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] ml-1" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/member/appointment')} 
                className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <div className="bg-[#8D6E63] w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#5D4037]">
                  Janji Temu
                </h3>
                <div className="mt-3 sm:mt-4 flex items-center text-[#5D4037] font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                  Lihat Jadwal <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] ml-1" />
                </div>
              </div>
            </div>

            {/* KONSULTASI WHATSAPP */}
            <div 
              onClick={() => window.open('https://wa.me/+6281994204009', '_blank')} 
              className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-1 min-w-0">
                  <div className="bg-green-500 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform shadow-lg shrink-0">
                    <MessageCircle size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-[#5D4037] truncate">
                      Konsultasi WhatsApp
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A1887F] font-sans font-medium mt-0.5 sm:mt-1 line-clamp-1">
                      Layanan bantuan langsung dari admin kami.
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6 text-gray-300 group-hover:text-[#8D6E63] transition-colors shrink-0" />
              </div>
            </div>

            {/* FITUR ULASAN */}
            <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="bg-[#F9F6F2] p-5 sm:p-6 md:p-10 md:w-1/3 flex flex-col justify-center">
                <div className="bg-[#8D6E63]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-[#8D6E63] mx-auto md:mx-0">
                  <Star size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" fill="currentColor" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-display font-bold mb-1 sm:mb-2 tracking-tight text-center md:text-left">
                  Ulasan Saya
                </h3>
                <p className="text-[10px] sm:text-xs text-[#A1887F] font-sans leading-relaxed text-center md:text-left">
                  Berikan rating dan ulasan Anda untuk kami.
                </p>
              </div>
              <div className="p-5 sm:p-6 md:p-10 flex-1 bg-white">
                <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                  <div className="flex gap-1.5 sm:gap-2 justify-center md:justify-start">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className="focus:outline-none active:scale-95 transition-transform"
                      >
                        <Star 
                          size={20} 
                          className={`sm:w-[22px] sm:h-[22px] md:w-6 md:h-6 ${star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill={star <= reviewData.rating ? "#FACC15" : "none"} 
                        />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    rows="2" 
                    value={reviewData.comment} 
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Ceritakan pengalaman Anda di sini..." 
                    className="w-full bg-[#FDFBF7] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent focus:border-[#8D6E63] outline-none text-xs sm:text-sm font-sans transition-all font-medium"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 sm:py-4 bg-[#8D6E63] text-white font-display font-bold rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? (
                      "Memproses..."
                    ) : (
                      <>
                        <Send size={14} className="sm:w-4 sm:h-4" /> Publikasikan Ulasan
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION POPUP */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 w-full sm:min-w-[320px] sm:max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <h3 className={`text-xs sm:text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-2 sm:ml-4 flex-shrink-0 rounded-md inline-flex ${
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

      {/* EDIT PROFILE MODAL - CENTERED */}
      {isEditModalOpen && (
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
                    Lengkapi Profil Anda
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 font-sans">
                    Informasi diperlukan untuk layanan kami
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const isIncomplete = !formData.phone?.trim() || !formData.address?.trim();
                  if (isIncomplete) {
                    setNotification({
                      show: true,
                      type: 'error',
                      title: 'Profil Belum Lengkap',
                      message: 'Silakan lengkapi nomor telepon dan alamat terlebih dahulu'
                    });
                  } else {
                    setIsEditModalOpen(false);
                  }
                }} 
                className="opacity-70 hover:opacity-100 transition-opacity bg-white/10 rounded-full p-2 hover:bg-white/20"
              >
                <X size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            
            {/* Form Body */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Nama Lengkap */}
                <div className="md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all" 
                    required
                  />
                </div>
                
                {/* Nomor Telepon */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone || ''} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="08123456789"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all" 
                    required
                  />
                  {!formData.phone?.trim() && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-sans">
                      ⚠️ Wajib diisi
                    </p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    placeholder="nama@email.com"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] placeholder:text-gray-400 transition-all" 
                    required
                  />
                </div>
                
                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="text-[10px] sm:text-xs font-bold text-[#8D6E63] uppercase tracking-wider block mb-2 font-sans">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={formData.address || ''} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    placeholder="Jl. Merdeka No. 123, Kota Malang"
                    className="w-full bg-[#FDFBF7] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl outline-none border-2 border-gray-200 focus:border-[#8D6E63] text-sm sm:text-base font-medium font-sans text-[#5D4037] resize-none placeholder:text-gray-400 transition-all" 
                    rows="2" 
                    required
                  />
                  {!formData.address?.trim() && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-sans">
                      ⚠️ Wajib diisi
                    </p>
                  )}
                </div>
                
                {/* Info Box */}
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
                  <div className="text-amber-600 shrink-0 mt-0.5">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-[10px] sm:text-xs text-amber-800 font-medium font-sans leading-relaxed">
                    Data diperlukan untuk konfirmasi appointment.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer - Action Buttons */}
            <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-5 flex gap-3 sm:gap-4 rounded-b-2xl sm:rounded-b-3xl border-t border-gray-200">
              <button 
                onClick={() => {
                  const isIncomplete = !formData.phone?.trim() || !formData.address?.trim();
                  if (isIncomplete) {
                    setNotification({
                      show: true,
                      type: 'error',
                      title: 'Profil Belum Lengkap',
                      message: 'Silakan lengkapi nomor telepon dan alamat terlebih dahulu'
                    });
                  } else {
                    setIsEditModalOpen(false);
                  }
                }} 
                className="flex-1 max-w-[140px] py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl font-sans font-bold text-xs uppercase tracking-wider text-[#8D6E63] hover:bg-gray-100 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-2.5 sm:py-3 bg-[#8D6E63] text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#8D6E63]/20 hover:bg-[#5D4037] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={14} className="sm:w-4 sm:h-4"/> Simpan Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;