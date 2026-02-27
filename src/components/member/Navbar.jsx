import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Calendar, MessageCircle, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'member', 'admin', atau null

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Debug: Lihat apa yang ada di localStorage
    console.log('=== Navbar Debug ===');
    console.log('localStorage active_user:', localStorage.getItem('active_user'));
    
    // Parsing data user
    let userData = null;
    try {
      userData = JSON.parse(localStorage.getItem('active_user'));
      console.log('Parsed userData:', userData);
    } catch (e) {
      console.error('Error parsing active_user:', e);
    }
    
    // Tentukan tipe user berdasarkan role
    if (userData) {
      setUser(userData);
      
      // Log detail untuk debugging
      console.log('User role:', userData.role);
      
      // Cek role dengan berbagai kemungkinan penulisan
      const role = userData.role ? userData.role.toLowerCase() : '';
      if (role === 'admin' || role === 'administrator') {
        console.log('✅ User TERDETEKSI sebagai ADMIN');
        setUserType('admin');
      } else {
        console.log('✅ User TERDETEKSI sebagai MEMBER');
        setUserType('member');
      }
    } else {
      console.log('❌ User TIDAK LOGIN');
      setUser(null);
      setUserType(null);
    }
    
    setIsMenuOpen(false);
    setIsMemberMenuOpen(false);
    setIsAdminMenuOpen(false);
  }, [location]);

  const LOGO_FILENAME = "logomochint.svg"; 

  const navItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Perawatan', path: '/treatment' },
    { name: 'Skincare', path: '/product' },
    { name: 'Reseller', path: '/promo' },
    { name: 'Blog', path: '/information' },
    { name: 'Aplikasi Member', path: userType === 'member' ? '/member' : '/member-app', isMember: true },
  ];

  const memberMenuItems = [
    { name: 'Profil', path: '/member' },
    { name: 'Reservasi', path: '/member/booking/step-1' },
    { name: 'Janji Temu', path: '/member/appointment' },
    { name: 'Konsultasi', path: '#', isExternal: true },
  ];

  const handleMemberClick = (e) => {
    e.preventDefault();
    
    console.log('Button clicked, userType:', userType);
    
    if (!userType) {
      console.log('Navigasi ke /member-app (belum login)');
      navigate('/member-app');
    } else if (userType === 'member') {
      console.log('Toggle menu MEMBER');
      setIsMemberMenuOpen(!isMemberMenuOpen);
      setIsAdminMenuOpen(false);
    } else if (userType === 'admin') {
      console.log('Toggle menu ADMIN');
      setIsAdminMenuOpen(!isAdminMenuOpen);
      setIsMemberMenuOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout');
    
    // Reset state terlebih dahulu
    setIsMemberMenuOpen(false);
    setIsAdminMenuOpen(false);
    setIsMenuOpen(false);
    setUser(null);
    setUserType(null);
    
    // Clear localStorage
    localStorage.removeItem('active_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate setelah cleanup
    setTimeout(() => {
      navigate('/');
    }, 0);
  };

  // Fungsi untuk mendapatkan nama depan user
  const getUserFirstName = () => {
    if (!user) return '';
    
    // Coba ambil dari name dulu (untuk Google OAuth)
    if (user.name) {
      return user.name.split(' ')[0];
    }
    
    // Coba ambil dari full_name
    if (user.full_name) {
      return user.full_name.split(' ')[0];
    }
    
    // Kalau tidak ada, ambil dari username
    if (user.username) {
      return user.username.split(' ')[0];
    }
    
    // Kalau tidak ada ketiganya, return 'Member'
    return 'Member';
  };

  const getButtonText = () => {
    console.log('getButtonText - userType:', userType, 'user:', user, 'role:', user?.role);
    
    if (userType === 'admin' && user) {
      return 'Administrator';
    } else if (userType === 'member' && user) {
      const firstName = getUserFirstName();
      return `Hi, ${firstName}`;
    } else {
      return 'Masuk';
    }
  };

  const getMobileButtonText = () => {
    if (userType === 'admin' && user) {
      return 'Admin';
    } else if (userType === 'member' && user) {
      return getUserFirstName();
    } else {
      return 'Member';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 font-sans">
      {/* OVERLAY */}
      {(isMemberMenuOpen || isAdminMenuOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => {
          setIsMemberMenuOpen(false);
          setIsAdminMenuOpen(false);
        }}></div>
      )}

      <div className="container mx-auto px-6 py-4 relative z-50">
        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center justify-between">
          {/* LOGO */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <img
                src={`/${LOGO_FILENAME}`} 
                alt="Mochint Beauty Care Logo"
                className="h-11 w-auto transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error(`Logo ${LOGO_FILENAME} tidak ditemukan di public folder`);
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback w-11 h-11 bg-[#8D6E63] rounded-xl flex items-center justify-center shadow-lg hidden">
                <span className="text-white font-display font-bold text-2xl uppercase">M</span>
              </div>
            </div>
          </div>

          {/* MENU ITEMS */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              item.isMember ? (
                <div key={item.name} className="relative ml-2">
                  <button
                    onClick={handleMemberClick}
                    className={`flex items-center px-6 py-2.5 font-sans font-bold text-[13px] uppercase tracking-wider transition-all rounded-xl border-2 ${
                      userType
                        ? `bg-[#3E2723] text-white border-[#3E2723] shadow-lg`
                        : `text-[#8D6E63] border-[#8D6E63] hover:bg-[#8D6E63] hover:text-white`
                      }`}
                  >
                    <User size={16} className="mr-2" />
                    {getButtonText()}
                    {userType && <ChevronDown size={14} className="ml-1" />}
                  </button>

                  {/* Dropdown Menu Admin */}
                  {userType === 'admin' && isAdminMenuOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 py-2 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-4 border-b border-gray-50 bg-[#FDFBF7]">
                        <p className="font-display font-bold text-[#3E2723] truncate text-sm">
                          {user?.username || user?.full_name || 'Administrator'}
                        </p>
                        <p className="text-[10px] text-[#8D6E63] font-black uppercase tracking-widest mt-0.5">
                          ADMIN PANEL
                        </p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            console.log('Navigasi ke dashboard admin');
                            navigate('/admin/dashboard');
                            setIsAdminMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-[#FDFBF7] hover:text-[#8D6E63] rounded-xl transition-colors font-sans"
                        >
                          <svg className="w-[18px] h-[18px] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Dashboard Admin
                        </button>
                      </div>

                      <div className="border-t border-gray-50 mt-1 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors font-sans"
                        >
                          <LogOut size={18} className="mr-3" /> Keluar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Menu Member */}
                  {userType === 'member' && isMemberMenuOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 py-2 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="px-6 py-4 border-b border-gray-50 bg-[#FDFBF7]">
                        <p className="font-display font-bold text-[#3E2723] truncate text-sm">
                          {user?.name || user?.full_name || user?.username || 'Member'}
                        </p>
                        <p className="text-[10px] text-[#8D6E63] font-black uppercase tracking-widest mt-0.5">
                          ID: {user?.id || ''}
                        </p>
                      </div>

                      <div className="p-2">
                        {memberMenuItems.map((menuItem) => (
                          menuItem.isExternal ? (
                            <button 
                              key={menuItem.name} 
                              onClick={() => {
                                console.log('Buka WhatsApp');
                                window.open('https://wa.me/6281234567890', '_blank');
                                setIsMemberMenuOpen(false);
                              }} 
                              className="flex items-center w-full px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors font-sans"
                            >
                              <MessageCircle size={18} className="mr-3 text-green-500" /> 
                              {menuItem.name}
                            </button>
                          ) : (
                            <NavLink 
                              key={menuItem.name} 
                              to={menuItem.path}
                              onClick={() => {
                                console.log('Navigasi ke:', menuItem.path);
                                setIsMemberMenuOpen(false);
                              }}
                              className="flex items-center px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-[#FDFBF7] hover:text-[#8D6E63] rounded-xl transition-colors font-sans"
                            >
                              {menuItem.name === 'Profil' && <User size={18} className="mr-3" />}
                              {menuItem.name === 'Reservasi' && <Calendar size={18} className="mr-3" />}
                              {menuItem.name === 'Janji Temu' && <Calendar size={18} className="mr-3" />}
                              {menuItem.name}
                            </NavLink>
                          )
                        ))}
                      </div>

                      <div className="border-t border-gray-50 mt-1 p-2">
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors font-sans"
                        >
                          <LogOut size={18} className="mr-3" /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-[13px] font-sans font-bold uppercase tracking-widest transition-all ${
                      isActive 
                        ? "text-[#3E2723] border-b-2 border-[#8D6E63] pb-1" 
                        : "text-gray-400 hover:text-[#8D6E63]"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              )
            ))}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className="flex md:hidden items-center justify-between">
          {/* Mobile Logo */}
          <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
            <img
              src={`/${LOGO_FILENAME}`}
              alt="Mochint Logo"
              className="h-8 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.getElementById('mobile-logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div id="mobile-logo-fallback" className="hidden">
              <span className="text-xl font-display font-bold text-[#3E2723] tracking-tighter">
                MOCHINT
              </span>
            </div>
          </div>

          {/* Right Side: Member/Admin Button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={handleMemberClick}
                className="flex items-center px-4 py-2 bg-[#3E2723] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
              >
                <User size={14} className="mr-1.5" />
                {getMobileButtonText()}
                {userType && <ChevronDown size={12} className="ml-1" />}
              </button>

              {/* Dropdown Menu Admin - Mobile */}
              {userType === 'admin' && isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 py-2 z-[60] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 bg-[#FDFBF7]">
                    <p className="font-bold text-[#3E2723] text-xs">
                      {user?.username || user?.full_name || 'Administrator'}
                    </p>
                    <p className="text-[9px] text-[#8D6E63] font-black uppercase tracking-widest mt-0.5">
                      ADMIN PANEL
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setIsAdminMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#FDFBF7] hover:text-[#8D6E63] rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard Admin
                    </button>
                  </div>

                  <div className="border-t border-gray-50 mt-1 p-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown Menu Member - Mobile */}
              {userType === 'member' && isMemberMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 py-2 z-[60] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 bg-[#FDFBF7]">
                    <p className="font-bold text-[#3E2723] text-xs truncate">
                      {user?.name || user?.full_name || user?.username || 'Member'}
                    </p>
                    <p className="text-[9px] text-[#8D6E63] font-black uppercase tracking-widest mt-0.5">
                      ID: {user?.id || ''}
                    </p>
                  </div>

                  <div className="p-2">
                    {memberMenuItems.map((menuItem) => (
                      menuItem.isExternal ? (
                        <button 
                          key={menuItem.name} 
                          onClick={() => {
                            window.open('https://wa.me/6281234567890', '_blank');
                            setIsMemberMenuOpen(false);
                          }} 
                          className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors"
                        >
                          <MessageCircle size={16} className="mr-2 text-green-500" /> 
                          {menuItem.name}
                        </button>
                      ) : (
                        <NavLink 
                          key={menuItem.name} 
                          to={menuItem.path}
                          onClick={() => setIsMemberMenuOpen(false)}
                          className="flex items-center px-3 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#FDFBF7] hover:text-[#8D6E63] rounded-xl transition-colors"
                        >
                          {menuItem.name === 'Profil' && <User size={16} className="mr-2" />}
                          {menuItem.name === 'Reservasi' && <Calendar size={16} className="mr-2" />}
                          {menuItem.name === 'Janji Temu' && <Calendar size={16} className="mr-2" />}
                          {menuItem.name}
                        </NavLink>
                      )
                    ))}
                  </div>

                  <div className="border-t border-gray-50 mt-1 p-2">
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#3E2723] p-1">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Items */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-6 bg-white space-y-1 border-t pt-4 animate-in fade-in zoom-in-95 duration-200">
            {navItems.map((item) => {
              if (item.isMember) return null;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl font-bold text-sm tracking-wide ${
                      isActive 
                        ? "bg-[#FDFBF7] text-[#8D6E63]" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;