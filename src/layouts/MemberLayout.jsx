import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/member/Sidebar';

const MemberLayout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('=== MemberLayout Mounted ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    console.log('Active User:', localStorage.getItem('active_user'));
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('User role:', user.role || user.user_type);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);
  
  // Check authentication (check both 'user' and 'active_user' for backward compatibility)
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') || localStorage.getItem('active_user');
  
  console.log('Auth check - Token exists:', !!token);
  console.log('Auth check - User exists:', !!user);
  
  // If no token or user, redirect to login
  if (!token || !user) {
    console.log('No auth data found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Parse user to check role
  let userData = null;
  try {
    userData = JSON.parse(user);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  
  // Optional: Check if user is actually a member
  // Jika Anda ingin hanya member yang bisa akses, bukan admin
  if (userData.role === 'admin' || userData.role === 'super_admin') {
    console.log('Admin user trying to access member area, redirecting to admin');
    return <Navigate to="/admin" replace />;
  }
  
  console.log('User authenticated, rendering member layout');
  
  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default MemberLayout;