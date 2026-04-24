import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronDown, Loader2, Calendar, Clock, User, CreditCard } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import { mockAppointments } from "../../api/mockData";

const Appointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil data user dari localStorage
        const activeUserStr = localStorage.getItem('active_user');
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('🔍 Debug Appointment - Token:', token ? 'EXISTS' : 'NOT FOUND');

        let userData = null;
        if (activeUserStr) {
          userData = JSON.parse(activeUserStr);
        } else if (userStr) {
          userData = JSON.parse(userStr);
        }

        if (!userData || !userData.id) {
          console.warn('❌ User data tidak ditemukan di localStorage');
          setError('Silakan login terlebih dahulu');
          setLoading(false);
          return;
        }

        if (!token) {
          console.warn('❌ Token tidak ditemukan');
          setError('Token tidak ditemukan. Silakan login ulang.');
          setLoading(false);
          return;
        }

        const memberId = userData.id;
        console.log('📋 Fetching appointments for member:', memberId);

        // Panggil API endpoint untuk mendapatkan appointment berdasarkan member_id
        const response = await appointmentAPI.getByMember(memberId);
        console.log('✅ API Response:', response.data);

        // Filter appointment dengan status 'confirmed' saja
        const upcomingAppointments = response.data.data.filter(
          item => item.status === 'confirmed'
        );
        console.log('✅ Confirmed appointments:', upcomingAppointments.length);

        // Mapping data dari database ke format yang dibutuhkan
        const formattedAppointments = upcomingAppointments.map(item => ({
          id: item.id,
          treatmentName: item.treatment_name || 'Treatment tidak tersedia',
          date: item.date ? new Date(item.date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '-',
          time: item.time || '-',
          price: item.amount || 0,
          status: item.status,
          customerName: item.customer_name || userData.name || 'Pasien'
        }));

        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("❌ Server API error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        if (error.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
        } else {
          console.log("⚠️ Menggunakan data fallback dari mockData.js");
          // Fallback ke mockData jika API tidak tersedia
          const localUpcoming = mockAppointments.filter(
            item => item.status === 'Confirmed'
          );
          const formattedMockData = localUpcoming.map(item => ({
            id: item.id,
            treatmentName: item.treatmentName,
            date: item.date,
            time: '10:00 WIB',
            price: parseInt(item.price.replace(/[^0-9]/g, '')),
            status: 'confirmed',
            customerName: 'Siti Maulana'
          }));
          setAppointments(formattedMockData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmed' }
    };

    const config = statusConfig[status] || statusConfig.confirmed;

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-sans ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-black uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button
          onClick={() => navigate('/member')}
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-bold">
          Janji Temu
        </span>
      </nav>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-[#8D6E63] mb-3 tracking-tight leading-none">
            Jadwal Janji Temu Anda
          </h1>
          <p className="text-gray-600 text-sm md:text-base font-medium font-sans">
            Kelola jadwal perawatan Anda yang sudah dikonfirmasi
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm font-semibold">⚠️ {error}</p>
            {error.includes('login') && (
              <button
                onClick={() => navigate('/login')}
                className="mt-2 text-xs text-red-600 underline hover:text-red-800"
              >
                Klik di sini untuk login
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#8D6E63]" size={40} />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white">
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider font-sans">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider font-sans">
                        Treatment
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider font-sans">
                        Tanggal & Waktu
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider font-sans">
                        Harga
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider font-sans">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.length > 0 ? (
                      appointments.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#FFF8F5] transition-all duration-200 group cursor-pointer ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                          onClick={() => navigate(`/member/appointment/${item.id}`)}
                        >
                          <td className="px-6 py-5">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {index + 1}
                              </div>
                              <span className="font-display font-bold text-[#3E2723] text-base group-hover:text-[#8D6E63] transition-colors">
                                {item.treatmentName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-600 font-sans">
                                {item.date}
                              </span>
                              <span className="text-xs text-[#8D6E63] font-semibold font-sans mt-1">
                                {item.time}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="text-base font-display font-bold text-[#3E2723]">
                              Rp {item.price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/member/appointment/${item.id}`);
                              }}
                              className="px-4 py-2 bg-[#8D6E63]/10 text-[#8D6E63] rounded-lg text-xs font-bold hover:bg-[#8D6E63] hover:text-white transition-all"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Calendar size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-400 font-medium font-sans">
                              Tidak ada jadwal appointment
                            </p>
                            <button
                              onClick={() => navigate('/member/booking/step1')}
                              className="mt-2 px-6 py-2.5 bg-[#8D6E63] text-white rounded-lg text-sm font-bold hover:bg-[#6D4C41] transition-colors"
                            >
                              Buat Appointment
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {appointments.length > 0 ? (
                appointments.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/member/appointment/${item.id}`)}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-white font-bold text-sm font-sans tracking-wide">
                          APPOINTMENT #{String(item.id).slice(-4).toUpperCase()}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Treatment Name */}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 font-sans">
                          Treatment
                        </p>
                        <p className="text-lg font-display font-bold text-[#3E2723]">
                          {item.treatmentName}
                        </p>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      {/* Date & Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide font-sans">
                            Tanggal
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-700 font-sans block">
                            {item.date}
                          </span>
                          <span className="text-xs text-[#8D6E63] font-semibold font-sans">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide font-sans">
                            Total Biaya
                          </span>
                        </div>
                        <span className="text-xl font-display font-bold text-[#8D6E63]">
                          Rp {item.price.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      {/* Action Button */}
                      <button className="w-full mt-3 py-3 bg-[#8D6E63]/10 text-[#8D6E63] rounded-xl text-sm font-bold hover:bg-[#8D6E63] hover:text-white transition-all font-sans">
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400 font-medium font-sans">
                      Tidak ada jadwal appointment
                    </p>
                    <button
                      onClick={() => navigate('/member/booking/step1')}
                      className="mt-4 px-6 py-2.5 bg-[#8D6E63] text-white rounded-lg text-sm font-bold hover:bg-[#6D4C41] transition-colors"
                    >
                      Buat Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Appointment;