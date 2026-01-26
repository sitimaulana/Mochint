import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppointmentProvider } from '../context/AppointmentContext';
import { MemberProvider } from '../context/MemberContext';
import { TherapistProvider } from '../context/TherapistContext';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import Appointment from '../pages/admin/Appointment';
import Member from '../pages/admin/Member';
import Treatment from '../pages/admin/Treatment';
import Product from '../pages/admin/Product';
import Therapist from '../pages/admin/Therapist'; 
import Information from '../pages/admin/Information';

const AppRoutes = () => {
  return (
    <Router>
      <AppointmentProvider>
        <MemberProvider>
          <TherapistProvider> 
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="appointment" element={<Appointment />} />
                <Route path="member" element={<Member />} />
                <Route path="treatment" element={<Treatment />} />
                <Route path="product" element={<Product />} />
                <Route path="therapist" element={<Therapist />} /> 
                <Route path="information" element={<Information />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TherapistProvider>
        </MemberProvider>
      </AppointmentProvider>
    </Router>
  );
};

export default AppRoutes;