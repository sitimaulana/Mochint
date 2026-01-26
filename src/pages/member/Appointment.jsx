import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronDown, Loader2 } from 'lucide-react';
import { mockAppointments } from "../../api/mockData"; 

const Appointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/appointments?userId=M0001');
        const data = await response.json();
        
        const upcoming = data.filter(item => item.status === 'Pending' || item.status === 'Confirmed');
        setAppointments(upcoming);
      } catch (error) {
        console.warn("Server API Offline, menggunakan data lokal");
        const localUpcoming = mockAppointments.filter(
          item => item.status === 'Pending' || item.status === 'Confirmed'
        );
        setAppointments(localUpcoming);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const FilterButton = ({ label }) => (
    <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:border-[#8D6E63] transition-all min-w-[100px] font-sans">
      {label} <ChevronDown size={14} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      
      {/* NAVBAR: Menggunakan font-display untuk label aktif */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')} 
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-display">
          Appointment
        </span>
      </nav>

      <div className="max-w-6xl mx-auto text-left">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-[#8D6E63] mb-2 tracking-tighter leading-tight">Appointment</h1>
        <p className="text-gray-500 mb-10 text-sm md:text-base font-sans font-medium">Tampil memukau setiap hari dengan solusi kecantikan modern!</p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['Status', 'Treatment', 'Waktu', 'Harga', 'More'].map(f => (
            <FilterButton key={f} label={f} />
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#8D6E63]" size={32} />
          </div>
        ) : (
          <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50">
                  {appointments.length > 0 ? (
                    appointments.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => navigate(`/member/appointment/${item.id}`)}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-sans ${
                              item.status === 'Pending' ? 'bg-[#A67B7B] text-white' : 'bg-[#6DA67C] text-white'
                            }`}>
                              {item.status}
                            </span>
                            <span className="font-display font-bold text-[#5D4037] group-hover:text-[#8D6E63] transition-colors tracking-tight">
                              {item.treatmentName}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-gray-500 font-sans font-medium italic">
                          {item.date}
                        </td>
                        <td className="p-6 text-sm font-display font-bold text-[#5D4037] text-right">
                          Rp.{item.price}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-20 text-center text-gray-400 italic font-sans font-medium">
                        Tidak ada jadwal perawatan mendatang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;