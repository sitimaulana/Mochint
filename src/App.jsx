import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { MemberProvider } from './context/MemberContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { TherapistProvider } from './context/TherapistContext';

function App() {
  return (
    <AppointmentProvider>
      <MemberProvider>
        <TherapistProvider>
            {/* AppRoutes di sini sudah bersih, hanya berisi Routing */}
            <AppRoutes />
        </TherapistProvider>
      </MemberProvider>
    </AppointmentProvider>
  );
}

export default App;