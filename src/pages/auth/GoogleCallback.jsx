import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userString = searchParams.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        
        console.log('✅ Google login success');
        console.log('Token:', token);
        console.log('User:', user);
        console.log('Needs password:', user.needsPassword);
        
        if (user.needsPassword) {
          console.log('🔐 User needs to set password, redirecting to email verification');
          navigate('/auth/verify-email', {
            state: { user, token },
            replace: true
          });
        } else {
          console.log('✅ User already has password, logging in directly');
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('active_user', JSON.stringify(user));
          localStorage.setItem('user_type', 'member');
          localStorage.setItem('login_time', new Date().toISOString());
          
          navigate('/member', { replace: true });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/auth/login?error=invalid_callback');
      }
    } else {
      navigate('/auth/login?error=missing_data');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 border-4 text-[#8D6E63] animate-spin mx-auto mb-4" />
        <p className="text-[#3E2723] font-medium text-sm sm:text-base">Memproses login dengan Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
