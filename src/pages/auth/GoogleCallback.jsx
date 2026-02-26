import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        
        // Store authentication data (save to both 'user' and 'active_user' for compatibility)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('active_user', JSON.stringify(user));
        localStorage.setItem('user_type', 'member');
        localStorage.setItem('login_time', new Date().toISOString());
        
        console.log('✅ Google login success, redirecting to /member');
        console.log('Token:', token);
        console.log('User:', user);
        
        // Redirect to member dashboard
        navigate('/member');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/auth/login?error=invalid_callback');
      }
    } else {
      navigate('/auth/login?error=missing_data');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#3E2723] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#3E2723] font-medium">Memproses login dengan Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
