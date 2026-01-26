import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  History, 
  ClipboardList, 
  Home, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Fungsi untuk mengecek rute aktif agar styling berubah
  const isActive = (path) => location.pathname === path;

  // FUNGSI LOGOUT (Menghapus session dan pindah ke Home)
  const handleLogout = () => {
    localStorage.removeItem('active_user'); 
    navigate('/'); 
    window.location.reload(); 
  };

  const menuItems = [
    { name: 'Dashboard', path: '/member', icon: <LayoutDashboard size={20} /> },
    { name: 'Booking', path: '/member/booking/step-1', icon: <CalendarCheck size={20} /> },
    { name: 'Appointment', path: '/member/appointment', icon: <ClipboardList size={20} /> },
    { name: 'History', path: '/member/history', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen hidden md:flex flex-col sticky top-0 font-sans">
      
      {/* Logo / Title Area - Menggunakan Poppins */}
      <div className="p-10">
        <h2 className="text-3xl font-display font-bold text-[#3E2723] tracking-tighter">Mochint</h2>
        <p className="text-[10px] font-black text-[#8D6E63] uppercase tracking-[0.3em] mt-1.5 font-sans">Member Services</p>
      </div>

      {/* Main Navigation - Menggunakan Inter Bold untuk List */}
      <nav className="flex-1 px-6 space-y-3">
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
      <div className="p-8 border-t border-gray-50 space-y-3 bg-[#FDFBF7]/30">
        {/* Fitur Kembali ke Homepage */}
        <Link 
          to="/" 
          className="flex items-center gap-4 p-4 text-[#8D6E63] hover:bg-white hover:shadow-sm rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest"
        >
          <Home size={20} />
          <span>Homepage</span>
        </Link>

        {/* Simulasi Logout */}
        <button 
          className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all font-sans font-bold text-xs uppercase tracking-widest text-left group"
          onClick={handleLogout}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;