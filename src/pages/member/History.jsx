import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronDown, Loader2 } from 'lucide-react';

// PERBAIKAN: Jalur import disesuaikan dengan src/api/mockData.js
import { mockHistory } from '../../api/mockData'; 

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/appointments?userId=M0001');
        const data = await response.json();
        const completed = data.filter(item => item.status === 'Completed');
        setHistory(completed);
      } catch (error) {
        console.warn("Server API offline, menggunakan data fallback dari mockData.js");
        const localCompleted = mockHistory.filter(item => item.status === 'Completed');
        setHistory(localCompleted);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const FilterButton = ({ label }) => (
    <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-[#8D6E63] transition-all min-w-[100px] font-sans">
      {label} <ChevronDown size={14} />
    </button>
  );

  return (
    /* font-sans (Inter) sebagai base */
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      
      {/* NAVBAR: Icon Home / History */}
      <nav className="flex items-center gap-3 text-[10px] md:text-xs mb-8 font-black uppercase tracking-[0.2em] text-gray-400 font-sans">
        <button 
          onClick={() => navigate('/member')} 
          className="p-2 bg-white rounded-lg shadow-sm text-[#8D6E63] hover:bg-[#8D6E63] hover:text-white transition-all"
        >
          <Home size={16} />
        </button>
        <span>/</span>
        <span className="text-[#8D6E63] bg-[#8D6E63]/10 px-4 py-1.5 rounded-full font-bold">
          History
        </span>
      </nav>

      <div className="max-w-6xl mx-auto">
        {/* font-display (Poppins) untuk Judul */}
        <h1 className="text-4xl md:text-6xl font-display font-bold text-[#8D6E63] mb-2 tracking-tighter">History</h1>
        <p className="text-gray-500 mb-10 text-sm md:text-base italic font-sans">Daftar perawatan yang telah selesai dilakukan.</p>

        <div className="flex flex-wrap gap-3 mb-8">
          {['Treatment', 'Waktu', 'Harga', 'More'].map(f => (
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
                <tbody className="divide-y divide-gray-50 font-sans">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                        {/* font-display (Poppins) untuk Nama Treatment agar tegas */}
                        <td className="p-6 font-display font-bold text-[#5D4037] group-hover:text-[#8D6E63] transition-colors">
                          {item.treatmentName}
                        </td>
                        <td className="p-6 text-sm text-gray-500 font-semibold font-sans">
                          {item.date}
                        </td>
                        <td className="p-6 text-sm font-bold text-[#5D4037] text-right font-display">
                          Rp {item.price.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-20 text-center text-gray-400 italic font-sans">
                        Belum ada riwayat perawatan.
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

export default History;