import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  History, 
  ClipboardList, 
  Home, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';
import { authAPI } from '../../api/client';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem('user');
        const activeUserStr = localStorage.getItem('active_user');
        
        console.log('Sidebar - localStorage user:', userStr);
        console.log('Sidebar - localStorage active_user:', activeUserStr);
        
        // Prioritize active_user, fallback to user
        const userData = activeUserStr ? JSON.parse(activeUserStr) : 
                        userStr ? JSON.parse(userStr) : null;
        
        if (userData) {
          setUser(userData);
        } else {
          console.warn('No user data found in localStorage');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
    
    // Listen for storage changes (if user data is updated elsewhere)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'active_user') {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fungsi untuk mengecek rute aktif agar styling berubah
  const isActive = (path) => {
    // Exact match for dashboard
    if (path === '/member' && location.pathname === '/member') return true;
    // For booking steps
    if (path.startsWith('/member/booking') && location.pathname.startsWith('/member/booking')) {
      return true;
    }
    // For other paths
    return location.pathname === path;
  };

  // FUNGSI LOGOUT (Menghapus session dan pindah ke Home)
  const handleLogout = () => {
    console.log('Logging out...');
    
    // Clear all auth-related data
    authAPI.logout(); // This removes token, user, active_user, isAdmin
    
    // Additional cleanup just in case
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_user');
    localStorage.removeItem('isAdmin');
    
    // Navigate to home
    navigate('/');
    
    // Optional: reload to reset app state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/member', icon: <LayoutDashboard size={20} /> },
    { name: 'Booking', path: '/member/booking/step-1', icon: <CalendarCheck size={20} /> },
    { name: 'Appointment', path: '/member/appointment', icon: <ClipboardList size={20} /> },
    { name: 'History', path: '/member/history', icon: <History size={20} /> },
   // { name: 'Profile', path: '/member/profile', icon: <User size={20} /> },
  ];

  // If no user data, don't show user info but still show sidebar
  const userName = user?.name || user?.email || 'Member';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen hidden md:flex flex-col sticky top-0 font-sans">
      
      {/* Logo / Title Area - Menggunakan Poppins */}
      <div className="p-10 border-b border-gray-50">
        <h2 className="text-3xl font-display font-bold text-[#3E2723] tracking-tighter">Mochint</h2>
        <p className="text-[10px] font-black text-[#8D6E63] uppercase tracking-[0.3em] mt-1.5 font-sans">Member Services</p>
      </div>

      {/* User Info Section */}
      <div className="p-6 border-b border-gray-50 bg-[#FDFBF7]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3E2723] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            {userInitial}
          </div>
          <div>
            <p className="font-sans font-bold text-sm text-[#3E2723] truncate max-w-[160px]">
              {userName}
            </p>
            <p className="font-sans text-xs text-[#8D6E63] mt-0.5">
              {user?.role === 'member' ? 'Premium Member' : user?.role || 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation - Menggunakan Inter Bold untuk List */}
      <nav className="flex-1 px-6 py-8 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
              isActive(item.path)
                ? 'bg-[#3E2723] text-white shadow-xl shadow-[#3E2723]/20 scale-[1.02]'
                : 'text-gray-400 hover:bg-[#FDFBF7] hover:text-[#8D6E63]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`${isActive(item.path) ? 'text-[#D7CCC8]' : 'text-inherit opacity-70 group-hover:opacity-100'}`}>
                {item.icon}
              </div>
              <span className={`font-sans font-bold text-[13px] tracking-widest uppercase transition-all ${
                isActive(item.path) ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
              }`}>
                {item.name}
              </span>
            </div>
            {isActive(item.path) && <ChevronRight size={16} className="text-[#8D6E63]" />}
          </Link>
        ))}
      </nav>

      {/* Bottom Area: Kembali ke Homepage & Logout */}
      <div className="p-6 border-t border-gray-50 space-y-2 bg-[#FDFBF7]/30">
        {/* Fitur Kembali ke Homepage */}
        <Link 
          to="/" 
          className="flex items-center gap-4 p-4 text-[#8D6E63] hover:bg-white hover:shadow-sm rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest"
        >
          <Home size={20} />
          <span>Homepage</span>
        </Link>

        {/* Logout Button */}
        <button 
          className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest text-left group"
          onClick={handleLogout}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
        
        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-mono">
              Path: {location.pathname}
            </p>
            <p className="text-xs text-gray-500 font-mono mt-1">
              User: {user ? 'Loaded' : 'Not found'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;