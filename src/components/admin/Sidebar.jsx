import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Appointment', path: '/admin/appointment' },
    { name: 'Member', path: '/admin/member' },
    { name: 'Treatment', path: '/admin/treatment' },
    { name: 'Product', path: '/admin/product' },
    { name: 'Therapist', path: '/admin/therapist' },
    { name: 'Information', path: '/admin/information' },
  ];

  // ============ GANTI NAMA FILE LOGO DI SINI ============
  const logoFile = "logomochint.svg"; // ← UBAH NAMA FILE DI SINI
  // ======================================================

  return (
    <div className="w-64 bg-white shadow-lg">
      {/* Logo Section - Simple */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          {/* Logo SVG Simple */}
          <img
            src={`/${logoFile}`}  // ← Logo diambil dari sini
            alt="Mochint Logo"
            className="h-10 w-auto"
          />

          {/* Brand Name */}

        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
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
  );
};

export default Sidebar;