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
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userStr = localStorage.getItem('user');
        const activeUserStr = localStorage.getItem('active_user');
        
        // Prioritize active_user, fallback to user
        const userData = activeUserStr ? JSON.parse(activeUserStr) : 
                        userStr ? JSON.parse(userStr) : null;
        
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
    
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'active_user') {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ✨ FUNGSI UNTUK MENGECEK RUTE AKTIF - UPDATED
  const isActive = (path) => {
    // Exact match untuk beranda
    if (path === '/member' && location.pathname === '/member') {
      return true;
    }
    
    // Match untuk booking dan semua sub-routenya
    if (path.startsWith('/member/booking') && location.pathname.startsWith('/member/booking')) {
      return true;
    }
    
    // ✨ Match untuk appointment dan detail appointment
    if (path === '/member/appointment') {
      return location.pathname === '/member/appointment' || 
             location.pathname.startsWith('/member/appointment/');
    }
    
    // ✨ Match untuk history dan detail history
    if (path === '/member/history') {
      return location.pathname === '/member/history' || 
             location.pathname.startsWith('/member/history/');
    }
    
    // Default exact match
    return location.pathname === path;
  };

  // FUNGSI LOGOUT - Langsung hapus localStorage
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Logging out...');
    
    // Langsung hapus semua data dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('active_user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear session storage juga jika ada
    sessionStorage.clear();
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    // Navigate to home with replace to prevent back navigation
    navigate('/', { replace: true });
    
    // Force reload to reset app state
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  const menuItems = [
    { name: 'Aplikasi Member', path: '/member', icon: <LayoutDashboard size={20} />, mobileIcon: <LayoutDashboard size={24} /> },
    { name: 'Reservasi', path: '/member/booking/step-1', icon: <CalendarCheck size={20} />, mobileIcon: <CalendarCheck size={24} /> },
    { name: 'Janji Temu', path: '/member/appointment', icon: <ClipboardList size={20} />, mobileIcon: <ClipboardList size={24} /> },
    { name: 'Riwayat', path: '/member/history', icon: <History size={20} />, mobileIcon: <History size={24} /> },
  ];

  const userName = user?.name || user?.email || 'Member';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 h-screen hidden lg:flex flex-col sticky top-0 font-sans">
        {/* Logo */}
        <div className="p-10 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <img src="/logomochint.svg" alt="Mochint Logo" className="w-38 h-38 drop-shadow-lg" />
          </div>
        </div>

        {/* User Info */}
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

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
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
                <div className={`${isActive(item.path) ? 'text-[#D7CCC8]' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </div>
                <span className={`font-sans font-bold text-[13px] tracking-widest uppercase ${
                  isActive(item.path) ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                }`}>
                  {item.name}
                </span>
              </div>
              {isActive(item.path) && <ChevronRight size={16} className="text-[#8D6E63]" />}
            </Link>
          ))}
        </nav>

        {/* Bottom Area */}
        <div className="p-6 border-t border-gray-50 space-y-2 bg-[#FDFBF7]/30">
          <Link 
            to="/" 
            className="flex items-center gap-4 p-4 text-[#8D6E63] hover:bg-white hover:shadow-sm rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest"
          >
            <Home size={20} />
            <span>Beranda</span>
          </Link>
          <button 
            type="button"
            className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest text-left group cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-3 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Buka menu"
          >
            <Menu size={24} className="text-[#3E2723]" />
          </button>    
        </div>
        <div className="w-8 h-8 bg-[#3E2723] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
          {userInitial}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-30 flex items-center justify-around shadow-lg">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
              isActive(item.path)
                ? 'text-[#3E2723]'
                : 'text-gray-400 hover:text-[#8D6E63]'
            }`}
          >
            <div className={`${isActive(item.path) ? 'scale-110' : ''} transition-transform`}>
              {item.mobileIcon}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${
              isActive(item.path) ? 'text-[#3E2723]' : 'text-gray-400'
            }`}>
              {item.name}
            </span>
            {isActive(item.path) && (
              <div className="absolute -top-1 w-1 h-1 bg-[#3E2723] rounded-full" />
            )}
          </Link>
        ))}
      </nav>


      {/* Mobile Drawer */}
    
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
        isMobileMenuOpen ? 'visible' : 'invisible'
      }`}>
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logomochint.svg" alt="Mochint Logo" className="w-38 h-38 drop-shadow-lg" />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="text-[#3E2723]" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-100 bg-[#FDFBF7]/50">
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

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isActive(item.path)
                      ? 'bg-[#3E2723] text-white'
                      : 'text-gray-400 hover:bg-[#FDFBF7] hover:text-[#8D6E63]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${isActive(item.path) ? 'text-[#D7CCC8]' : ''}`}>
                      {item.icon}
                    </div>
                    <span className="font-sans font-bold text-sm">
                      {item.name}
                    </span>
                  </div>
                  {isActive(item.path) && <ChevronRight size={16} className="text-[#8D6E63]" />}
                </Link>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-100 space-y-2 bg-[#FDFBF7]/30">
              <Link 
                to="/" 
                className="flex items-center gap-4 p-4 text-[#8D6E63] hover:bg-white hover:shadow-sm rounded-xl transition-all font-sans font-bold text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span>Beranda</span>
              </Link>
              <button 
                type="button"
                className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-50 rounded-xl transition-all font-sans font-bold text-sm text-left group cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;