import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { MemberProvider } from './context/MemberContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { TherapistProvider } from './context/TherapistContext';
import { TreatmentProvider } from './context/TreatmentContext'; 

function App() {
  return (
    <TreatmentProvider>
      <AppointmentProvider>
        <MemberProvider>
          <TherapistProvider>
            {/* AppRoutes berisi seluruh navigasi Public, Member, dan Admin */}
            <AppRoutes />
          </TherapistProvider>
        </MemberProvider>
      </AppointmentProvider>
    </TreatmentProvider>
  );
}

export default App;