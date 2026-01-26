import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "../components/member/Navbar";
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Navbar diletakkan di atas (Sticky opsional) */}
      <Navbar />

      {/* 2. Main content dibiarkan tumbuh (flex-grow) tanpa dikunci overflow-nya */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. (Opsional) Footer bisa ditaruh disini nanti */}
    </div>
  );
};

export default PublicLayout;