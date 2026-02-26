import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Calendar, Clock, MapPin, CheckCircle, Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import { mockAppointments } from '../../api/mockData';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('❌ Token tidak ditemukan');
          setError('Token tidak ditemukan. Silakan login ulang.');
          setLoading(false);
          return;
        }

        console.log('📋 Fetching appointment detail for ID:', id);

        // Panggil API endpoint untuk mendapatkan detail appointment berdasarkan ID
        const response = await appointmentAPI.getById(id);
        console.log('✅ API Response:', response.data);

        const appointmentData = response.data.data;

        // Format data dari database ke format yang dibutuhkan UI
        const formattedData = {
          id: appointmentData.id,
          treatmentName: appointmentData.treatment_name || 'Treatment tidak tersedia',
          date: appointmentData.date ? new Date(appointmentData.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '-',
          time: appointmentData.time || '-',
          price: appointmentData.amount ? `Rp ${appointmentData.amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'Rp 0',
          priceRaw: appointmentData.amount || 0,
          therapistName: appointmentData.therapist_name || 'Therapist tidak tersedia',
          status: appointmentData.status === 'pending' ? 'Pending' : 
                  appointmentData.status === 'confirmed' ? 'Confirmed' :
                  appointmentData.status === 'completed' ? 'Completed' :
                  appointmentData.status === 'cancelled' ? 'Cancelled' : 'Unknown',
          customerName: appointmentData.customer_name || 'Pasien',
          location: 'Mochint Pandaan' // Default location, bisa disesuaikan jika ada di database
        };

        setData(formattedData);
      } catch (error) {
        console.error("❌ Server API error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        if (error.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
        } else if (error.response?.status === 404) {
          setError('Data appointment tidak ditemukan.');
        } else {
          console.log("⚠️ Menggunakan data fallback dari mockData.js");
          // Fallback ke mockData jika API tidak tersedia
          const foundData = mockAppointments.find(item => item.id === id);
          if (foundData) {
            setData({
              ...foundData,
              customerName: 'Siti Maulana',
              location: 'Mochint Pandaan'
            });
          } else {
            setError('Data appointment tidak ditemukan.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointmentDetail();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-sans">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#8D6E63] mx-auto mb-4" size={48} />
          <p className="font-bold text-[#8D6E63] font-display text-xl tracking-tight">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-sans p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="font-bold text-red-600 mb-2 font-display text-xl tracking-tight">⚠️ {error}</p>
          {error.includes('login') && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2.5 bg-[#8D6E63] text-white rounded-lg text-sm font-bold hover:bg-[#6D4C41] transition-colors"
            >
              Login Sekarang
            </button>
          )}
          <button 
            onClick={() => navigate('/member/appointment')} 
            className="block mt-4 mx-auto text-sm text-gray-500 font-sans hover:text-[#8D6E63] transition-colors underline"
          >
            Kembali ke Daftar Janji Temu
          </button>
        </div>
      </div>
    );
  }

  // Data not found state
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-sans">
        <div className="text-center">
          <p className="font-bold text-[#8D6E63] mb-4 font-display text-xl tracking-tight">Data tidak ditemukan...</p>
          <button onClick={() => navigate('/member/appointment')} className="text-sm text-gray-500 font-sans hover:text-[#8D6E63] transition-colors">Kembali ke Daftar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm 10mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 0 !important;
            margin: 0 !important;
            page-break-inside: avoid;
          }
          #printable-area > div {
            box-shadow: none !important;
            border: 1.5px solid #e0e0e0 !important;
            border-radius: 0 !important;
            padding: 10px !important;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 8px !important;
            padding-bottom: 8px !important;
            border-bottom: 2px solid #8D6E63;
            page-break-after: avoid;
          }
          .print-title {
            font-size: 16px !important;
            font-weight: bold;
            color: #8D6E63;
            text-align: center;
            margin-bottom: 2px !important;
            letter-spacing: 1px;
          }
          .print-subtitle {
            font-size: 9px !important;
            text-align: center;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
          }
          .print-footer {
            display: block !important;
            margin-top: 8px !important;
            padding-top: 8px !important;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 7px !important;
            color: #666;
            line-height: 1.3 !important;
            page-break-before: avoid;
          }
          /* Compact status header */
          #printable-area > div > div:first-of-type {
            padding: 8px 10px !important;
          }
          #printable-area > div > div:first-of-type h2 {
            font-size: 16px !important;
            line-height: 1 !important;
          }
          #printable-area > div > div:first-of-type p {
            font-size: 7px !important;
            margin-bottom: 2px !important;
          }
          #printable-area > div > div:first-of-type svg {
            width: 24px !important;
            height: 24px !important;
          }
          /* Compact content area */
          #printable-area > div > div:nth-of-type(2) {
            padding: 10px !important;
          }
          /* Treatment name and ID section */
          #printable-area > div > div:nth-of-type(2) > div:first-child {
            padding-bottom: 8px !important;
            margin-bottom: 8px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:first-child h3 {
            font-size: 14px !important;
            margin-top: 2px !important;
            line-height: 1.2 !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:first-child p {
            font-size: 12px !important;
            line-height: 1 !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:first-child label {
            font-size: 7px !important;
            margin-bottom: 1px !important;
          }
          /* Info cards - more compact */
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) {
            margin: 0 !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) > div {
            padding: 5px 8px !important;
            margin-bottom: 4px !important;
            border-radius: 4px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div:first-child {
            padding: 4px !important;
            border-radius: 4px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) > div svg {
            width: 12px !important;
            height: 12px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) p {
            line-height: 1.2 !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) label {
            font-size: 7px !important;
            margin-bottom: 1px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:nth-of-type(2) .font-bold {
            font-size: 9px !important;
          }
          /* Total payment section - compact */
          #printable-area > div > div:nth-of-type(2) > div:last-child {
            padding-top: 8px !important;
            margin-top: 8px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:last-child > div {
            padding: 8px !important;
            border-radius: 6px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:last-child p:first-of-type {
            font-size: 7px !important;
            margin-bottom: 2px !important;
          }
          #printable-area > div > div:nth-of-type(2) > div:last-child p:nth-of-type(2) {
            font-size: 18px !important;
            line-height: 1 !important;
          }
          /* Simplify rounded corners */
          .rounded-full, .rounded-2xl, .rounded-xl, .rounded-lg {
            border-radius: 4px !important;
          }
          /* Compact footer */
          .print-footer p {
            margin: 1px 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
        {/* NAVBAR: Menggunakan font-display untuk label aktif */}
        <nav className="no-print flex items-center gap-2 md:gap-3 text-[10px] md:text-xs mb-6 md:mb-8 font-bold uppercase tracking-[0.2em] text-gray-400 font-sans">
          <button 
            onClick={() => navigate('/member')} 
            className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
          >
            <Home size={16} />
          </button>
          <span className="hidden md:inline">/</span>
          <button 
            onClick={() => navigate('/member/appointment')} 
            className="hidden md:inline hover:text-[#8D6E63] transition-colors font-sans"
          >
            Janji Temu
          </button>
          <span className="hidden md:inline">/</span>
          <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full font-display lowercase first-letter:uppercase text-[9px] md:text-[10px]">
            Detail
          </span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* KARTU DETAIL */}
          <div id="printable-area" className="bg-white rounded-2xl md:rounded-[40px] shadow-md md:shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Print Header - Only visible when printing */}
            <div className="print-header hidden">
              <div className="print-title">MOCHINT BEAUTY CLINIC</div>
              <div className="print-subtitle">Detail Janji Temu</div>
            </div>

            {/* Header Status - Font Display (Poppins) */}
            <div className={`p-6 md:p-8 lg:p-10 flex justify-between items-center text-white ${
              data.status === 'Pending' ? 'bg-[#A67B7B]' : 
              data.status === 'Confirmed' ? 'bg-[#6DA67C]' :
              data.status === 'Completed' ? 'bg-[#4A90E2]' :
              data.status === 'Cancelled' ? 'bg-[#D32F2F]' : 'bg-[#757575]'
            }`}>
              <div className="flex-1">
                <p className="text-[9px] md:text-[10px] font-black uppercase opacity-80 tracking-wider md:tracking-widest mb-1 font-sans">Status Janji Temu</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold tracking-tight md:tracking-tighter leading-none">{data.status}</h2>
              </div>
              <CheckCircle size={36} className="opacity-25 md:hidden" />
              <CheckCircle size={48} className="opacity-25 hidden md:block" />
            </div>

            <div className="p-5 md:p-8 lg:p-12 space-y-6 md:space-y-8 lg:space-y-10">
              {/* Bagian Utama: Layanan & ID */}
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 pb-6 md:pb-8 lg:pb-10 border-b border-gray-100">
                <div className="space-y-1 md:space-y-2 flex-1">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-[0.2em] font-sans block">Layanan Perawatan</label>
                  <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-display font-bold text-[#8D6E63] leading-tight tracking-tight md:tracking-tighter break-words">
                    {data.treatmentName}
                  </h3>
                </div>
                <div className="text-left md:text-right space-y-1 md:shrink-0">
                  <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-[0.2em] font-sans block">ID Booking</label>
                  <p className="text-lg md:text-xl font-display font-bold text-[#5D4037]">#{data.id}</p>
                </div>
              </div>

              {/* Bagian Informasi Detail */}
              <div className="space-y-4 md:space-y-5 py-2">
                {/* Tanggal */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 text-[#5D4037] p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#8D6E63]/5">
                  <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl text-[#8D6E63] border border-[#8D6E63]/10 shrink-0">
                    <Calendar size={18} className="md:hidden" />
                    <Calendar size={20} className="hidden md:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest font-sans mb-0.5 md:mb-1">Tanggal</p>
                    <p className="font-sans font-bold text-sm md:text-base text-[#5D4037] break-words">{data.date}</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 text-[#5D4037] p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#8D6E63]/5">
                  <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl text-[#8D6E63] border border-[#8D6E63]/10 shrink-0">
                    <Clock size={18} className="md:hidden" />
                    <Clock size={20} className="hidden md:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest font-sans mb-0.5 md:mb-1">Waktu</p>
                    <p className="font-sans font-bold text-sm md:text-base text-[#5D4037]">{data.time}</p>
                  </div>
                </div>

                {/* Therapist */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 text-[#5D4037] p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#8D6E63]/5">
                  <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl text-[#8D6E63] border border-[#8D6E63]/10 shrink-0">
                    <svg className="w-[18px] h-[18px] md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest font-sans mb-0.5 md:mb-1">Therapist</p>
                    <p className="font-sans font-bold text-sm md:text-base text-[#5D4037] break-words">{data.therapistName}</p>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 text-[#5D4037] p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#8D6E63]/5">
                  <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl text-[#8D6E63] border border-[#8D6E63]/10 shrink-0">
                    <MapPin size={18} className="md:hidden" />
                    <MapPin size={20} className="hidden md:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest font-sans mb-0.5 md:mb-1">Lokasi</p>
                    <p className="font-sans font-bold text-sm md:text-base text-[#5D4037] break-words">{data.location}</p>
                  </div>
                </div>

                {/* Nama Pasien */}
                <div className="flex items-start md:items-center gap-3 md:gap-4 text-[#5D4037] p-3 md:p-4 bg-[#FDFBF7] rounded-xl md:rounded-2xl border border-[#8D6E63]/5">
                  <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl text-[#8D6E63] border border-[#8D6E63]/10 shrink-0">
                    <CheckCircle size={18} className="md:hidden" />
                    <CheckCircle size={20} className="hidden md:block" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest font-sans mb-0.5 md:mb-1">Nama Pasien</p>
                    <p className="font-sans font-bold text-sm md:text-base text-[#5D4037] break-words">{data.customerName}</p>
                  </div>
                </div>
              </div>

              {/* Bagian Akhir: Biaya */}
              <div className="pt-6 md:pt-8 lg:pt-10 border-t border-dashed border-gray-200">
                <div className="bg-gradient-to-br from-[#8D6E63]/5 to-[#6D4C41]/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#8D6E63]/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest mb-1 md:mb-2 font-sans">Total Pembayaran</p>
                      <p className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-[#8D6E63] tracking-tight md:tracking-tighter">{data.price}</p>
                    </div>
                    <div className="hidden md:flex w-16 h-16 bg-[#8D6E63]/10 rounded-full items-center justify-center">
                      <svg className="w-8 h-8 text-[#8D6E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="no-print flex flex-col md:flex-row gap-3 mt-6 md:mt-8">
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-3 md:py-3.5 bg-white text-gray-600 font-bold rounded-xl md:rounded-2xl border-2 border-gray-200 hover:bg-gray-50 hover:border-[#8D6E63]/30 transition-all text-xs md:text-[11px] uppercase tracking-wider md:tracking-widest font-sans shadow-sm"
                  >
                    <ArrowLeft size={16} className="md:hidden" />
                    <ArrowLeft size={18} className="hidden md:block" />
                    <span>Kembali</span>
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 md:flex-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white font-bold rounded-xl md:rounded-2xl shadow-lg shadow-[#8D6E63]/30 hover:shadow-xl hover:shadow-[#8D6E63]/40 hover:from-[#6D4C41] hover:to-[#5D4037] transition-all text-xs md:text-[11px] uppercase tracking-wider md:tracking-widest font-sans"
                  >
                    <Printer size={16} className="md:hidden" />
                    <Printer size={18} className="hidden md:block" />
                    <span>Cetak Nota</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Print Footer - Only visible when printing */}
            <div className="print-footer hidden">
              <p style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: '10px' }}>Terima kasih atas kepercayaan Anda</p>
              <p style={{ fontSize: '9px' }}>Mochint Beauty Clinic - Jl. Sidomukti No.13, Pandaan, Pasuruan, Jawa Timur</p>
              <p style={{ marginTop: '4px', fontSize: '9px' }}>Telp: (0343) 123456 | Email: info@mochint.com</p>
            </div>
          </div>

          {/* Info Alamat Klinik - Not printed */}
          <p className="no-print mt-6 md:mt-8 text-center text-[9px] md:text-[10px] text-gray-400 leading-relaxed max-w-lg mx-auto italic uppercase tracking-wider md:tracking-[0.2em] font-sans font-medium px-4">
            Jl. Sidomukti No.13 RT03, RW04, Pesantren, Pandaan, Kec. Pandaan, Pasuruan, Jawa Timur 67156
          </p>
        </div>
      </div>
    </>
  );
};

export default AppointmentDetail;