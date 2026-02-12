import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Member = () => {
  // API URLs
  const MEMBERS_API_URL = 'http://localhost:5000/api/members';
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
  const HISTORY_API_URL = 'http://localhost:5000/api/members/history';

  const Token = localStorage.getItem('token');
  
  const [members, setMembers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '', // Field alamat baru ditambahkan
    joinDate: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    totalVisits: 0,
    status: 'active',
    lastVisit: 'Belum Pernah'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingHistory, setViewingHistory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [memberHistory, setMemberHistory] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  
  // State untuk notification modal
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' atau 'error'
    title: '',
    message: ''
  });

  // Ambil data members dan appointments
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-hide notification setelah 3 detik
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [membersRes, appointmentsRes] = await Promise.all([
        axios.get(MEMBERS_API_URL, {headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(APPOINTMENTS_API_URL, {headers: {Authorization: `Bearer ${Token}`}})
      ]);
      
      // Proses members dengan data dari appointments
      const processedMembers = membersRes.data.data.map(member => {

        // Ambil appointments untuk member ini
        const memberAppointments = appointmentsRes.data.data.filter(
          app => app.member_id && app.member_id.toString() === member.id.toString()
        );
        
        // Filter appointments yang statusnya 'completed'
        const completedAppointments = memberAppointments.filter(
          app => app.status === 'completed'
        );
        
        // Hitung total kunjungan (berdasarkan appointments yang selesai)
        const totalVisits = completedAppointments.length;
        
        // Cari kunjungan terakhir dari appointments yang selesai
        let lastVisit = 'Belum Pernah';
        if (completedAppointments.length > 0) {
          // Urutkan berdasarkan tanggal (terbaru ke terlama)
          const sortedAppointments = [...completedAppointments].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          
          // Ambil appointment terbaru
          const latestAppointment = sortedAppointments[0];
          lastVisit = latestAppointment.date;
        }
        
        return {
          ...member,
          total_visits: totalVisits,
          last_visit: lastVisit
        };
      });
      
      setMembers(processedMembers);
      setAppointments(appointmentsRes.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data. Silakan coba lagi.');
      console.error('Error memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk update statistik kunjungan member otomatis
  const updateMemberVisitStats = (memberId) => {
    // Filter appointments untuk member ini yang status 'completed'
    const memberAppointments = appointments.filter(
      app => app.member_id && app.member_id.toString() === memberId.toString()
    );
    
    const completedAppointments = memberAppointments.filter(
      app => app.status === 'completed'
    );
    
    const totalVisits = completedAppointments.length;
    let lastVisit = 'Belum Pernah';
    
    if (completedAppointments.length > 0) {
      const sortedAppointments = [...completedAppointments].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      lastVisit = sortedAppointments[0].date;
    }
    
    // Update state members
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.id.toString() === memberId.toString()
          ? { ...member, total_visits: totalVisits, last_visit: lastVisit }
          : member
      )
    );
    
    // Update ke database (opsional)
    axios.put(`${MEMBERS_API_URL}/${memberId}`, {
      total_visits: totalVisits,
      last_visit: lastVisit
    }).catch(err => {
      console.error('Error memperbarui statistik member:', err);
    });
  };

  // Ambil riwayat member dari API dengan fallback
  const fetchMemberHistory = async (memberId) => {
    try {
      setHistoryLoading(true);
      
      if (debugMode) {
        console.log(`📡 [DEBUG] Mengambil riwayat untuk member ID: ${memberId}`);
        console.log(`📡 [DEBUG] API URL: ${HISTORY_API_URL}/${memberId}`);
      }
      
      // Coba dari API terlebih dahulu
      try {
        const response = await axios.get(`${HISTORY_API_URL}/${memberId}`, {
          headers: { Authorization: `Bearer ${Token}` }
        }); 
        
        if (debugMode) {
          console.log(`📡 [DEBUG] Status Response API Riwayat: ${response.status}`);
          console.log(`📡 [DEBUG] Data Riwayat Diterima:`, response.data);
        }
        
        if (response.data && response.data.length > 0) {
          if (debugMode) {
            console.log(`📡 [DEBUG] Ditemukan ${response.data.length} catatan riwayat dari API`);
          }
          return response.data;
        } else {
          if (debugMode) {
            console.log(`📡 [DEBUG] Tidak ada catatan riwayat dari API, menggunakan fallback`);
          }
        }
      } catch (apiError) {
        console.warn('⚠️ API Riwayat tidak tersedia, menggunakan fallback:', apiError.message);
        if (debugMode) {
          console.warn(`📡 [DEBUG] Detail Error API:`, apiError.response?.data || apiError.message);
        }
      }
      
      // Fallback: ambil dari appointments yang selesai
      const completedAppointments = appointments.data.filter(app => 
        app.member_id && 
        app.member_id.toString() === memberId.toString() &&
        app.status === 'completed'
      );
      
      if (debugMode) {
        console.log(`📡 [DEBUG] Ditemukan ${completedAppointments.length} appointments selesai untuk fallback`);
      }
      
      // Konversi appointments ke format riwayat
      const fallbackHistory = completedAppointments.map(app => ({
        id: app.id,
        member_id: app.member_id,
        appointment_id: app.appointment_id || `APT-${app.id}`,
        customer_name: app.customer_name,
        treatment_name: app.treatment,
        therapist: app.therapist,
        date: app.date,
        time: app.time,
        amount: app.amount,
        status: app.status,
        notes: `Janji temu selesai pada ${app.date}`,
        created_at: new Date().toISOString()
      }));
      
      return fallbackHistory;
      
    } catch (err) {
      console.error('❌ Error dalam fetchMemberHistory:', err);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  // Test API Riwayat untuk debugging
  const testHistoryAPI = async () => {
    if (members.length > 0) {
      const testMemberId = members[0].id;
      console.log('🧪 [TEST] Menguji API riwayat untuk member:', testMemberId);
      
      try {
        const response = await axios.get(`${HISTORY_API_URL}/${testMemberId}`);
        console.log('🧪 [TEST] Response API:', response.data);
        alert(`✅ Hasil Test API: ${response.data.length} catatan ditemukan\nCek konsol untuk detail.`);
      } catch (error) {
        console.error('🧪 [TEST] Error API:', error);
        alert(`❌ Error API: ${error.message}\nCek konsol untuk detail.`);
      }
    } else {
      alert('Tidak ada member tersedia untuk testing');
    }
  };

  // Handle ketika status appointment berubah di halaman Appointment
  const handleAppointmentStatusChange = (appointment) => {
    if (appointment.member_id && appointment.status === 'completed') {
      updateMemberVisitStats(appointment.member_id);
    }
  };

  // Hitung statistik
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    totalVisits: members.reduce((sum, member) => sum + (parseInt(member.total_visits) || 0), 0),
    newThisMonth: members.filter(m => {
      const joinDate = m.join_date || m.joinDate;
      if (!joinDate) return false;
      const joinMonth = new Date(joinDate).getMonth();
      const currentMonth = new Date().getMonth();
      return joinMonth === currentMonth;
    }).length
  };

  // Filter members berdasarkan pencarian dan filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone || '').includes(searchTerm) ||
      (member.address || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Cari alamat
      (member.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  console.log(filteredMembers);
  

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '', // Alamat default kosong
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      totalVisits: 0,
      status: 'active',
      lastVisit: 'Belum Pernah'
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member.id);
    setIsAdding(false);
    setFormData({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '', // Include alamat
      joinDate: member.join_date || member.joinDate || '',
      totalVisits: member.total_visits || member.totalVisits || 0,
      status: member.status || 'active',
      lastVisit: member.last_visit || member.lastVisit || 'Belum Pernah'
    });
  };

  const handleSave = async () => {
    // Validasi email
    if (formData.email && !formData.email.includes('@')) {
      alert('Harap masukkan alamat email yang valid');
      return;
    }

    // Validasi telepon (minimal 10 digit)
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      alert('Harap masukkan nomor telepon yang valid (minimal 10 digit)');
      return;
    }

    setSaveLoading(true);

    try {
      if (isAdding) {
        if (!formData.name?.trim()) {
          alert('Nama wajib diisi');
          setSaveLoading(false);
          return;
        }
        
        const newMemberData = {
          name: formData.name.trim(),
          email: formData.email?.trim() || '',
          phone: formData.phone || '',
          address: formData.address?.trim() || '',
          password: '123456' // Default password
        };
        
        const response = await axios.post(MEMBERS_API_URL, newMemberData, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const newMember = response.data.data || response.data;
        setMembers([newMember, ...members]);
        setIsAdding(false);
        
        // Tampilkan notifikasi sukses
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil Menambahkan!',
          message: 'Member baru berhasil ditambahkan'
        });
      } else {
        if (!formData.name?.trim()) {
          alert('Nama wajib diisi');
          setSaveLoading(false);
          return;
        }
        
        const updatedMemberData = {
          name: formData.name.trim(),
          email: formData.email?.trim() || '',
          phone: formData.phone || '',
          address: formData.address?.trim() || '', // Include alamat
          join_date: formData.joinDate || '',
          total_visits: parseInt(formData.totalVisits) || 0,
          status: formData.status || 'active',
          last_visit: formData.lastVisit || 'Belum Pernah'
        };
        
        const response = await axios.put(`${MEMBERS_API_URL}/${editingMember}`, updatedMemberData, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const updatedMember = response.data.data || response.data;
        setMembers(members.map(member => 
          member.id === editingMember ? { ...member, ...updatedMember } : member
        ));
        
        // Tampilkan notifikasi sukses
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil Memperbarui!',
          message: 'Data member berhasil diperbarui'
        });
      }
      
      handleCancel();
    } catch (err) {
      console.error('Error menyimpan member:', err);
      
      // Tampilkan notifikasi error
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data member'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingMember(null);
    setIsAdding(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '', // Reset alamat
      joinDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      totalVisits: 0,
      status: 'active',
      lastVisit: 'Belum Pernah'
    });
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${MEMBERS_API_URL}/${showDeleteConfirm}`, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      setMembers(members.filter(member => member.id !== showDeleteConfirm));
      setShowDeleteConfirm(null);
      
      // Tampilkan notifikasi sukses
      setNotification({
        show: true,
        type: 'success',
        title: 'Berhasil Menghapus!',
        message: 'Member berhasil dihapus dari sistem'
      });
    } catch (err) {
      console.error('Error menghapus member:', err);
      
      // Tampilkan notifikasi error
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.response?.data?.error || 'Terjadi kesalahan saat menghapus member'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const viewHistory = async (member) => {
    console.log('👁️ [RIWAYAT] Melihat riwayat untuk member:', member);
    setHistoryLoading(true);
    try {
      const history = await fetchMemberHistory(member.id);
      console.log('👁️ [RIWAYAT] Riwayat diambil:', history);
      
      setMemberHistory(history);
      setViewingHistory({...member, history: history});
      
    } catch (error) {
      console.error('❌ Error dalam viewHistory:', error);
      // Fallback ke appointments jika semua gagal
      const fallbackHistory = appointments.filter(app => 
        app.member_id && app.member_id.toString() === member.id.toString() &&
        app.status === 'completed'
      ).map(app => ({
        id: app.id,
        appointment_id: app.appointment_id || `APT-${app.id}`,
        customer_name: app.customer_name,
        treatment_name: app.treatment,
        therapist: app.therapist,
        date: app.date,
        time: app.time,
        amount: app.amount,
        status: app.status,
        notes: `Janji temu selesai pada ${app.date}`
      }));
      
      setMemberHistory(fallbackHistory);
      setViewingHistory({...member, history: fallbackHistory});
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setViewingHistory(null);
    setMemberHistory([]);
  };

  // Format mata uang
  const formatRupiah = (val) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // Loading state
  if (loading && members.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data member...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Member</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Page Title and Stats */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Member</h1>
            <p className="text-gray-600">Kelola member klinik dan riwayat perawatan mereka.</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Memuat...' : 'Tambah Member'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Member</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Member Aktif</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalVisits}</div>
            <div className="text-sm text-gray-600">Total Kunjungan</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.newThisMonth}</div>
            <div className="text-sm text-gray-600">Baru Bulan Ini</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Cari member berdasarkan nama, email, telepon, alamat, atau ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Member</h2>
          <span className="text-sm text-gray-500">
            Menampilkan {filteredMembers.length} dari {members.length} member
          </span>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat member...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Kontak</th>
                  <th className="pb-3 font-medium">Alamat</th>
                  <th className="pb-3 font-medium">Tanggal Bergabung</th>
                  <th className="pb-3 font-medium">Kunjungan</th>
                  <th className="pb-3 font-medium">Kunjungan Terakhir</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3">
                      <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {member.id}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg font-bold text-brown-600">
                            {member.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{member.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {(appointments.data.filter(app => 
                              app.member_id && app.member_id === member.id
                            ).length) || 0} janji temu
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-gray-600">{member.email || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{member.phone || 'N/A'}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={member.address || ''}>
                        {member.address || 'Tidak ada alamat'}
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {member.join_date || member.joinDate || 'N/A'}
                    </td>
                    <td className="py-3">
                      <div className="text-lg font-bold text-gray-800">
                        {member.total_visits || member.totalVisits || 0}
                      </div>
                      <div className="text-xs text-gray-400">kunjungan selesai</div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {member.last_visit || member.lastVisit || 'Belum Pernah'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status == 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status == 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewHistory(member)}
                          disabled={loading || historyLoading}
                          className="px-3 py-1 bg-brown-500 text-white rounded-lg hover:bg-brown-600 text-sm transition-colors duration-200 disabled:opacity-50"
                        >
                          {historyLoading ? 'Memuat...' : 'Riwayat'}
                        </button>
                        <button
                          onClick={() => handleEdit(member)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors duration-200 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition-colors duration-200 disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.645a4 4 0 00-5.197-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Member tidak ditemukan</h3>
            <p className="text-gray-500 mb-6">Coba sesuaikan pencarian atau kriteria filter Anda.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              Tambah Member Baru
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(editingMember || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isAdding ? 'Tambah Member Baru' : 'Edit Member'}
            </h3>
            <div className="space-y-4">
              {!isAdding && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Member
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id || ''}
                    disabled
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="email@contoh.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="081234567890"
                />
              </div>

              {/* Field Alamat Baru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap"
                  rows="2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alamat lengkap (jalan, kota, kode pos)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Kunjungan
                  </label>
                  <input
                    type="number"
                    name="totalVisits"
                    value={formData.totalVisits || 0}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Bergabung
                </label>
                <input
                  type="text"
                  name="joinDate"
                  value={formData.joinDate || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="15 Jan 2023"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 15 Jan 2023
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kunjungan Terakhir
                </label>
                <input
                  type="text"
                  name="lastVisit"
                  value={formData.lastVisit || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Diperbarui otomatis dari janji temu selesai"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Diperbarui otomatis ketika janji temu selesai
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : isAdding ? (
                  'Tambah Member'
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Hapus Member</h3>
            <p className="text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus member ini? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  'Hapus Member'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className={`rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-bold ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-3 flex-shrink-0 ${
                  notification.type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Riwayat Perawatan - {viewingHistory.name}
                </h3>
                <p className="text-sm text-gray-600">
                  ID Member: <span className="font-medium">{viewingHistory.id}</span> | 
                  Total Kunjungan: <span className="font-medium">{viewingHistory.total_visits || viewingHistory.totalVisits || 0}</span>
                </p>
                {debugMode && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sumber Riwayat: {viewingHistory.history?.length > 0 ? 'API' : 'Fallback (Janji Temu)'} | 
                    Catatan: {viewingHistory.history?.length || 0}
                  </div>
                )}
              </div>
              <button
                onClick={closeHistory}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Member Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{viewingHistory.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Telepon</div>
                  <div className="font-medium">{viewingHistory.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Alamat</div>
                  <div className="font-medium">{viewingHistory.address || 'Tidak ada alamat'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tanggal Bergabung</div>
                  <div className="font-medium">{viewingHistory.join_date || viewingHistory.joinDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Kunjungan Terakhir</div>
                  <div className="font-medium">{viewingHistory.last_visit || viewingHistory.lastVisit || 'Belum Pernah'}</div>
                </div>
              </div>
            </div>

            {/* Treatment History Table */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Catatan Perawatan</h4>
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat riwayat...</p>
                </div>
              ) : viewingHistory.history && viewingHistory.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Perawatan</th>
                        <th className="pb-3 font-medium">Terapis</th>
                        <th className="pb-3 font-medium">Jumlah</th>
                        <th className="pb-3 font-medium">ID Janji Temu</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingHistory.history.map((record, index) => (
                        <tr key={record.id || index} className="border-b hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-3 text-sm">
                            <div>{record.date}</div>
                            {record.time && (
                              <div className="text-xs text-gray-400">{record.time}</div>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="text-sm font-medium">{record.treatment_name || record.treatment}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm text-brown-600 font-medium">{record.therapist}</div>
                          </td>
                          <td className="py-3">
                            <div className="text-sm font-bold text-green-700">
                              {formatRupiah(record.amount)}
                            </div>
                          </td>
                          <td className="py-3 text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {record.appointment_id || record.appointmentId || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {record.status === 'completed' ? 'Selesai' : record.status || 'Selesai'}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500 max-w-xs">
                            {record.notes || 'Tidak ada catatan'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat perawatan</h4>
                  <p className="text-gray-500">Member ini belum menyelesaikan perawatan apapun.</p>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Untuk menambahkan riwayat perawatan:</p>
                    <ol className="list-decimal list-inside mt-2 text-left max-w-md mx-auto">
                      <li>Pergi ke halaman Janji Temu</li>
                      <li>Selesaikan janji temu untuk member ini</li>
                      <li>Klik tombol "Selesaikan" pada janji temu</li>
                      <li>Riwayat akan tercatat secara otomatis</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Treatment Statistics */}
            {viewingHistory.history && viewingHistory.history.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Ringkasan Perawatan</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{viewingHistory.history.length}</div>
                    <div className="text-sm text-gray-600">Total Perawatan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {new Set(viewingHistory.history.map(h => h.treatment_name || h.treatment)).size}
                    </div>
                    <div className="text-sm text-gray-600">Jenis Perawatan Berbeda</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {new Set(viewingHistory.history.map(h => h.therapist)).size}
                    </div>
                    <div className="text-sm text-gray-600">Terapis Berbeda</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {formatRupiah(viewingHistory.history.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Jumlah</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={closeHistory}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Member;