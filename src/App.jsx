import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { MemberProvider } from './context/MemberContext';
import { AppointmentProvider } from './context/AppointmentContext';
import { TherapistProvider } from './context/TherapistContext';
import { TreatmentProvider } from './context/TreatmentContext'; // Import TreatmentProvider

function App() {
  return (
    <TreatmentProvider>
      <AppointmentProvider>
        <MemberProvider>
          <TherapistProvider>
            <AppRoutes />
          </TherapistProvider>
        </MemberProvider>
      </AppointmentProvider>
    </TreatmentProvider>
  );
}

export default App;