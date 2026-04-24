import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- PROVIDERS (DARI ADMIN/DATABASE) ---
import { AppointmentProvider } from '../context/AppointmentContext';
import { MemberProvider } from '../context/MemberContext';
import { TherapistProvider } from '../context/TherapistContext';

// --- LAYOUTS ---
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import MemberLayout from '../layouts/MemberLayout';

// --- PAGES: ADMIN (Diberi alias 'Admin' agar tidak bentrok) ---
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminAppointment from '../pages/admin/Appointment';
import AdminMemberManajemen from '../pages/admin/Member';
import AdminTreatment from '../pages/admin/Treatment';
import AdminProduct from '../pages/admin/Product';
import AdminTherapist from '../pages/admin/Therapist';
import AdminTherapistDetail from '../pages/admin/TherapistDetail';
import AdminInformation from '../pages/admin/Information';
import AdminPageContent from '../pages/admin/PageContent';
import AdminBedManagement from '../pages/admin/BedManagement';

// --- PAGES: AUTH & PUBLIC ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Regist';
import GoogleCallback from '../pages/auth/GoogleCallback';
import EmailVerification from '../pages/auth/EmailVerification';
import SetPassword from '../pages/auth/SetPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import PublicTreatment from '../pages/public/Treatment';
import PublicProduct from '../pages/public/Product';
import PublicInformation from '../pages/public/Information';
import InformationDetail from '../pages/public/InformationDetail'; 
import Promo from '../pages/public/Promo';

// --- PAGES: MEMBER ---
import MemberApp from '../pages/member/MemberApp';
import MemberDashboard from '../pages/member/Dashboard';
import MemberProfile from '../pages/member/Profile'; 
import MemberHistory from '../pages/member/History';
import MemberAppointment from '../pages/member/Appointment';
import MemberAppointmentDetail from '../pages/member/AppoinmentDetail';

// --- PAGES: BOOKING STEPS ---
import BookingStep1 from '../pages/member/booking/BookingStep1';
import BookingStep2 from '../pages/member/booking/BookingStep2';
import BookingStep3 from '../pages/member/booking/BookingStep3';
import BookingSuccess from '../pages/member/booking/BookingSuccess';

// --- UTILITY FUNCTIONS ---
const getUserRole = () => {
  const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    // Prioritize role, fallback to user_type
    return user.role || user.user_type;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const getUserData = () => {
  const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
  return !!(token && userStr);
};

// --- AUTH PROTECTED ROUTE COMPONENT (DIPERBAIKI) ---
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  // Check authentication (check both 'user' and 'active_user')
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
  
  console.log('🔒 ProtectedRoute check:', {
    path: location.pathname,
    hasToken: !!token,
    hasUser: !!userStr,
    allowedRoles,
    location: location.pathname
  });
  
  // If no token or user, redirect to login
  if (!token || !userStr) {
    console.log('❌ No auth, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // DAPATKAN ROLE USER (priority: role -> user_type)
    const userRole = user.role || user.user_type;
    
    console.log('👤 User info:', {
      role: user.role,
      user_type: user.user_type,
      resolvedRole: userRole,
      email: user.email
    });
    
    if (!userRole) {
      console.error('⚠️ User has no role or user_type:', user);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
    
    // If specific roles are required, check them
    if (allowedRoles.length > 0) {
      // Cek apakah role/user_type user diizinkan
      const hasAccess = allowedRoles.includes(userRole);
      
      if (!hasAccess) {
        console.log(`🚫 Access denied: ${userRole} not in ${allowedRoles.join(', ')}`);
        
        // Redirect berdasarkan user type
        if (userRole === 'admin') {
          return <Navigate to="/admin" replace />;
        } else if (userRole === 'member') {
          return <Navigate to="/member" replace />;
        } else {
          // Unknown role, go to home
          return <Navigate to="/" replace />;
        }
      }
    }
    
    console.log(`✅ Access granted for ${userRole}`);
    return children;
    
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    // Clear invalid data and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
    localStorage.removeItem('login_time');
    localStorage.removeItem('active_user');
    return <Navigate to="/login" replace />;
  }
};

// --- ADMIN PROTECTED ROUTE (DIPERBAIKI) ---
const AdminProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// --- MEMBER PROTECTED ROUTE (DIPERBAIKI) ---
const MemberProtectedRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['member']}>
      {children}
    </ProtectedRoute>
  );
};

// --- GLOBAL REDIRECT COMPONENT (DIPERBAIKI) ---
const GlobalRedirect = () => {
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    setIsChecking(false);
  }, []);
  
  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user') || localStorage.getItem('active_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // DAPATKAN ROLE USER (priority: role -> user_type)
      const userRole = user.role || user.user_type;
      
      console.log('🌍 GlobalRedirect - User role:', userRole);
      
      if (!userRole) {
        console.error('User has no role or user_type');
        return <Navigate to="/" replace />;
      }
      
      // Redirect based on role/user_type
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'member') {
        return <Navigate to="/member" replace />;
      } else {
        // Unknown role, go to home
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('Error parsing user in GlobalRedirect:', error);
      return <Navigate to="/" replace />;
    }
  }
  
  // If not logged in, go to home
  return <Navigate to="/" replace />;
};

// --- LOGIN REDIRECT COMPONENT ---
const LoginRedirect = () => {
  const location = useLocation();
  const from = location.state?.from || '/';
  
  // Jika sudah login, redirect ke dashboard berdasarkan role
  if (isAuthenticated()) {
    const userRole = getUserRole();
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'member') {
      return <Navigate to="/member" replace />;
    }
  }
  
  return <Navigate to="/login" state={{ from }} replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <AppointmentProvider>
        <MemberProvider>
          <TherapistProvider> 
            <Routes>
              
              {/* === ZONA 1: PUBLIC === */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="treatment" element={<PublicTreatment />} />
                <Route path="product" element={<PublicProduct />} />
                <Route path="information" element={<PublicInformation />} />
                <Route path="information/:id" element={<InformationDetail />} />
                <Route path="promo" element={<Promo />} />
                
                {/* Route untuk redirect ke login jika mencoba akses protected */}
                <Route path="member" element={<LoginRedirect />} />
                <Route path="admin" element={<LoginRedirect />} />
              </Route>
              
              {/* === ZONA 2: AUTHENTICATION === */}
              <Route path="/member-app" element={<MemberApp />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/auth/verify-email" element={<EmailVerification />} />
              <Route path="/auth/set-password" element={<SetPassword />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* === ZONA 3: MEMBER AREA === */}
              <Route path="/member" element={
                <MemberProtectedRoute>
                  <MemberLayout />
                </MemberProtectedRoute>
              }>
                <Route index element={<MemberDashboard />} />
                <Route path="profile" element={<MemberProfile />} />
                <Route path="history" element={<MemberHistory />} /> 
                <Route path="appointment" element={<MemberAppointment />} />
                <Route path="appointment/:id" element={<MemberAppointmentDetail />} />

                {/* Flow Booking */}
                <Route path="booking">
                   <Route index element={<Navigate to="step-1" replace />} />
                   <Route path="step-1" element={<BookingStep1 />} />
                   <Route path="step-2" element={<BookingStep2 />} />
                   <Route path="step-3" element={<BookingStep3 />} />
                   <Route path="success" element={<BookingSuccess />} />
                </Route>
              </Route>

              {/* === ZONA 4: ADMIN AREA === */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="appointment" element={<AdminAppointment />} />                <Route path="bed-management" element={<AdminBedManagement />} />                <Route path="member" element={<AdminMemberManajemen />} />
                <Route path="treatment" element={<AdminTreatment />} />
                <Route path="product" element={<AdminProduct />} />
                <Route path="therapist" element={<AdminTherapist />} />
                <Route path="therapist/:id" element={<AdminTherapistDetail />} />
                <Route path="information" element={<AdminInformation />} />
                <Route path="page-content" element={<AdminPageContent />} />
              </Route>

              {/* Global Redirect for 404 */}
              <Route path="*" element={<GlobalRedirect />} />
              
              {/* Debug routes for development */}
              {import.meta.env.MODE === 'development' && (
                <>
                  <Route path="/debug" element={
                    <div className="p-10">
                      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
                      
                      <div className="mb-6 p-4 bg-gray-100 rounded">
                        <h2 className="font-bold mb-2">Auth Status:</h2>
                        <p>Token: {localStorage.getItem('token') ? '✅ Present' : '❌ None'}</p>
                        <p>User: {localStorage.getItem('user') ? '✅ Present' : '❌ None'}</p>
                        <p>User Type: {localStorage.getItem('user_type') || 'None'}</p>
                        <p>Login Time: {localStorage.getItem('login_time') || 'None'}</p>
                      </div>
                      
                      <div className="mb-6 p-4 bg-gray-100 rounded">
                        <h2 className="font-bold mb-2">User Data:</h2>
                        <pre className="text-xs bg-gray-800 text-white p-2 rounded overflow-auto">
                          {localStorage.getItem('user') || 'No user data'}
                        </pre>
                      </div>
                      
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            localStorage.clear();
                            alert('LocalStorage cleared!');
                            window.location.href = '/';
                          }}
                          className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Clear All Storage
                        </button>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-member');
                            localStorage.setItem('user', JSON.stringify({
                              id: 888,
                              name: 'Test Member',
                              email: 'member@test.com',
                              phone: '081234567890',
                              user_type: 'member',
                              role: 'member',
                              is_admin: false
                            }));
                            localStorage.setItem('user_type', 'member');
                            window.location.href = '/member';
                          }}
                          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Simulate Member Login
                        </button>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-admin');
                            localStorage.setItem('user', JSON.stringify({
                              id: 999,
                              username: 'testadmin',
                              email: 'admin@test.com',
                              full_name: 'Test Administrator',
                              user_type: 'admin',
                              role: 'admin',
                              is_admin: true
                            }));
                            localStorage.setItem('user_type', 'admin');
                            window.location.href = '/admin';
                          }}
                          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Simulate Admin Login
                        </button>
                      </div>
                    </div>
                  } />
                  
                  <Route path="/test-login" element={
                    <div className="p-10 max-w-md mx-auto">
                      <h1 className="text-2xl font-bold mb-6">Test Login</h1>
                      
                      <div className="space-y-4">
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-member');
                            localStorage.setItem('user', JSON.stringify({
                              id: 888,
                              name: 'Test Member',
                              email: 'member@test.com',
                              user_type: 'member',
                              role: 'member',
                              is_admin: false
                            }));
                            localStorage.setItem('user_type', 'member');
                            console.log('✅ Test member login complete');
                            window.location.href = '/member';
                          }}
                          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Test as Member (user_type: member)
                        </button>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-admin');
                            localStorage.setItem('user', JSON.stringify({
                              id: 999,
                              username: 'testadmin',
                              email: 'admin@test.com',
                              full_name: 'Test Administrator',
                              user_type: 'admin',
                              role: 'admin',
                              is_admin: true
                            }));
                            localStorage.setItem('user_type', 'admin');
                            console.log('✅ Test admin login complete');
                            window.location.href = '/admin';
                          }}
                          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Test as Admin (user_type: admin)
                        </button>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-legacy');
                            localStorage.setItem('user', JSON.stringify({
                              id: 777,
                              name: 'Legacy User',
                              email: 'legacy@test.com',
                              role: 'member' // Hanya role, tanpa user_type
                            }));
                            console.log('✅ Test legacy login complete');
                            window.location.href = '/member';
                          }}
                          className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Test Legacy (role only: member)
                        </button>
                        
                        <button 
                          onClick={() => {
                            localStorage.setItem('token', 'test-token-legacy-admin');
                            localStorage.setItem('user', JSON.stringify({
                              id: 666,
                              username: 'legacyadmin',
                              email: 'legacyadmin@test.com',
                              role: 'admin' // Hanya role, tanpa user_type
                            }));
                            console.log('✅ Test legacy admin login complete');
                            window.location.href = '/admin';
                          }}
                          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Test Legacy Admin (role only: admin)
                        </button>
                      </div>
                    </div>
                  } />
                </>
              )}
            
            </Routes>
          </TherapistProvider>
        </MemberProvider>
      </AppointmentProvider>
    </Router>
  );
};

export default AppRoutes;