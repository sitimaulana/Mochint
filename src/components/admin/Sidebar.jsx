import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Appointment', path: '/admin/appointment' },
    { name: 'Member', path: '/admin/member' },
    { name: 'Treatment', path: '/admin/treatment' },
    { name: 'Product', path: '/admin/product' },
    { name: 'Therapist', path: '/admin/therapist' }, // TAMBAHKAN INI
    { name: 'Information', path: '/admin/information' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-brown-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold">M</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">MOCHINT</h1>
            <p className="text-sm text-gray-600">BEAUTY CARE</p>
          </div>
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
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
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