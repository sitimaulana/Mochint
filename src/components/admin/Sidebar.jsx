import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Beranda', path: '/admin' },
    { name: 'Janji Temu', path: '/admin/appointment' },
    { name: 'Manajemen Bed', path: '/admin/bed-management' },
    { name: 'Member', path: '/admin/member' },
    { name: 'Perawatan', path: '/admin/treatment' },
    { name: 'Produk', path: '/admin/product' },
    { name: 'Terapis', path: '/admin/therapist' },
    { name: 'Informasi', path: '/admin/information' },
    { name: 'Konten Halaman', path: '/admin/page-content' },
  ];

  // ============ GANTI NAMA FILE LOGO DI SINI ============
  const logoFile = "logomochint.svg"; // ← UBAH NAMA FILE DI SINI
  // ======================================================

  return (
    <>
      {/* Overlay - Only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
      {/* Bagian Logo - Sederhana */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
          {/* Logo SVG Sederhana */}
          <img
            src={`/${logoFile}`}  // ← Logo diambil dari sini
            alt="Logo Mochint"
            className="h-10 w-auto"
          />

          {/* Nama Merek */}

          </div>

          {/* Close button - Only visible on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-brown-100 text-brown-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </>
  );
};

export default Sidebar;