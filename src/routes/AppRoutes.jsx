import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- LAYOUTS ---
import PublicLayout from '../layouts/PublicLayout';
import MemberLayout from '../layouts/Memberlayout';
// --- PAGES: AUTH ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Regist';
// --- PAGES: PUBLIC ---
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Treatment from '../pages/public/Treatment';
import Product from '../pages/public/Product';
import Information from '../pages/public/Information';
import InformationDetail from '../pages/public/InformationDetail'; 
import Promo from '../pages/public/Promo';

// --- PAGES: MEMBER ---
import MemberApp from '../pages/member/MemberApp';
import Dashboard from '../pages/member/Dashboard';
import Profile from '../pages/member/Profile'; 
import History from '../pages/member/History';
import Appointment from '../pages/member/Appointment';
import AppointmentDetail from '../pages/member/Appoinmentdetail';
// --- PAGES: BOOKING STEPS ---
import BookingStep1 from '../pages/member/booking/BookingStep1';
import BookingStep2 from '../pages/member/booking/BookingStep2';
import BookingStep3 from '../pages/member/booking/BookingStep3';
import BookingSuccess from '../pages/member/booking/BookingSuccess';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* === ZONA 1: PUBLIC === */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="treatment" element={<Treatment />} />
          <Route path="product" element={<Product />} />
          <Route path="information" element={<Information />} />
          <Route path="information/:id" element={<InformationDetail />} />
          <Route path="promo" element={<Promo />} /> 
        </Route>
        
        {/* === ZONA 2: AUTHENTICATION === */}
        <Route path="member-app" element={<MemberApp />} /> 
        <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />
        {/* === ZONA 3: MEMBER AREA === */}
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<History />} /> 
          <Route path="appointment" element={<Appointment />} />
          <Route path="appointment/:id" element={<AppointmentDetail />} />

          {/* Flow Booking */}
          <Route path="booking">
             <Route index element={<Navigate to="step-1" replace />} />
             <Route path="step-1" element={<BookingStep1 />} />
             <Route path="step-2" element={<BookingStep2 />} />
             <Route path="step-3" element={<BookingStep3 />} />
             <Route path="success" element={<BookingSuccess />} />
          </Route>
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      
      </Routes>
    </Router>
  );
};

export default AppRoutes;