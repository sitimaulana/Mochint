import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- PROVIDERS (DARI ADMIN/DATABASE) ---
import { AppointmentProvider } from '../context/AppointmentContext';
import { MemberProvider } from '../context/MemberContext';
import { TherapistProvider } from '../context/TherapistContext';

// --- LAYOUTS ---
import AdminLayout from '../layouts/AdminLayout';
import PublicLayout from '../layouts/PublicLayout';
import MemberLayout from '../layouts/Memberlayout';

// --- PAGES: ADMIN (Diberi alias 'Admin' agar tidak bentrok) ---
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminAppointment from '../pages/admin/Appointment';
import AdminMemberManajemen from '../pages/admin/Member';
import AdminTreatment from '../pages/admin/Treatment';
import AdminProduct from '../pages/admin/Product';
import AdminTherapist from '../pages/admin/Therapist'; 
import AdminInformation from '../pages/admin/Information';

// --- PAGES: AUTH & PUBLIC ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Regist';
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
import MemberAppointmentDetail from '../pages/member/Appoinmentdetail';

// --- PAGES: BOOKING STEPS ---
import BookingStep1 from '../pages/member/booking/BookingStep1';
import BookingStep2 from '../pages/member/booking/BookingStep2';
import BookingStep3 from '../pages/member/booking/BookingStep3';
import BookingSuccess from '../pages/member/booking/BookingSuccess';

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
              </Route>
              
              {/* === ZONA 2: AUTHENTICATION === */}
              <Route path="/member-app" element={<MemberApp />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* === ZONA 3: MEMBER AREA === */}
              <Route path="/member" element={<MemberLayout />}>
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
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="appointment" element={<AdminAppointment />} />
                <Route path="member" element={<AdminMemberManajemen />} />
                <Route path="treatment" element={<AdminTreatment />} />
                <Route path="product" element={<AdminProduct />} />
                <Route path="therapist" element={<AdminTherapist />} /> 
                <Route path="information" element={<AdminInformation />} />
              </Route>

              {/* Redirect Global */}
              <Route path="*" element={<Navigate to="/" replace />} />
            
            </Routes>
          </TherapistProvider>
        </MemberProvider>
      </AppointmentProvider>
    </Router>
  );
};

export default AppRoutes;