import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/member/Sidebar'; // Atau Navbar Member

const MemberLayout = () => {
  return (
    <div className="flex">
      <Sidebar /> {/* Menu samping khusus member */}
      
      <div className="flex-1 p-8">
        <Outlet /> {/* Halaman Dashboard/Booking muncul di sini */}
      </div>
    </div>
  );
};

export default MemberLayout;