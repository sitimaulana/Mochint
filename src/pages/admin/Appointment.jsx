import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Appointment = () => {
  // API URLs
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
  const MEMBERS_API_URL = 'http://localhost:5000/api/members';
  const THERAPISTS_API_URL = 'http://localhost:5000/api/therapists';
  const TREATMENTS_API_URL = 'http://localhost:5000/api/treatments';
  const MEMBER_HISTORY_API_URL = 'http://localhost:5000/api/members/history';
  const APPOINTMENT_STATS_API_URL = 'http://localhost:5000/api/appointments/statistics';

  const Token = localStorage.getItem('token')

  // State
  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [stats, setStats] = useState({
    confirmed_count: 0,
    completed_count: 0,
    total_count: 0,
    total_revenue: 0,
    completed_revenue: 0
  });
  
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    customer_name: '', member_id: '', treatment: '', treatment_id: '', therapist: '', therapist_id: '',
    date: '', time: '', amount: 0, status: 'confirmed'
  });
  
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState({
    appointments: true,
    members: true,
    therapists: true,
    treatments: true,
    stats: false // statistik dihitung manual
  });
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { 
    fetchAllData(); 
  }, [refreshKey]);

  const fetchAllData = async () => {
    try {
      setLoading({
        appointments: true,
        members: true,
        therapists: true,
        treatments: true,
        stats: false
      });

      const [appointmentsRes, membersRes, therapistsRes, treatmentsRes] = await Promise.all([
        axios.get(APPOINTMENTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(MEMBERS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(THERAPISTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}}),
        axios.get(TREATMENTS_API_URL,{headers: {Authorization: `Bearer ${Token}`}})
      ]);
     
      const appointmentsData = appointmentsRes.data.data.map(app => ({ 
        ...app, 
        status: app.status || 'confirmed',
        amount: parseFloat(app.amount) || 0
      }));
      
      setAppointments(appointmentsData);
      // Pastikan struktur data konsisten dengan {data: [...]}
      setMembers(membersRes.data.data ? membersRes.data : { data: membersRes.data });
      setTherapists(therapistsRes.data.data ? therapistsRes.data : { data: therapistsRes.data });
      setTreatments(treatmentsRes.data.data ? treatmentsRes.data : { data: treatmentsRes.data });
      
      // Hitung statistik secara manual dari appointments
      calculateStatistics(appointmentsData);
      
      setError(null);
    } catch (err) { 
      console.error("Gagal memuat data", err); 
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally { 
      setLoading({
        appointments: false,
        members: false,
        therapists: false,
        treatments: false,
        stats: false
      });
    }
  };

  // Fungsi untuk menghitung statistik secara manual
  const calculateStatistics = (appointmentsData) => {
    const confirmed_count = appointmentsData.filter(app => app.status === 'confirmed').length;
    const completed_count = appointmentsData.filter(app => app.status === 'completed').length;
    const total_count = appointmentsData.length;
    
    // Hitung pendapatan
    const total_revenue = appointmentsData.reduce((sum, app) => sum + (app.amount || 0), 0);
    const completed_revenue = appointmentsData
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (app.amount || 0), 0);
    
    setStats({
      confirmed_count,
      completed_count,
      total_count,
      total_revenue,
      completed_revenue
    });
  };

  // --- FUNGSI UNTUK RIWAYAT MEMBER ---
  const addToMemberHistory = async (appointment) => {
    try {
      // Cek apakah appointment sudah selesai dan memiliki member_id
      if (appointment.status !== 'completed' || !appointment.member_id) {
        return;
      }

      // Cari data member untuk mendapatkan informasi lengkap
      const member = members.find(m => m.id == appointment.member_id);
      if (!member) {
        console.error('Member tidak ditemukan untuk ID:', appointment.member_id);
        return;
      }

      // Data untuk member_history
      const historyData = {
        member_id: appointment.member_id,
        appointment_id: appointment.id,
        customer_name: appointment.customer_name,
        treatment_name: appointment.treatment,
        therapist: appointment.therapist,
        date: appointment.date,
        time: appointment.time,
        amount: appointment.amount,
        status: 'completed',
        notes: `Appointment selesai pada ${appointment.date}`
      };

      // Simpan ke member_history
      await axios.post(MEMBER_HISTORY_API_URL, historyData);
      
      console.log('Menambahkan appointment ke riwayat member:', appointment.id);
      
    } catch (err) {
      console.error('Error menambahkan ke riwayat member:', err);
    }
  };

  // --- UPDATE KUNJUNGAN DAN RIWAYAT MEMBER ---
  const updateMemberData = async (memberId, appointment) => {
    try {
      // 1. Update jumlah kunjungan member dan kunjungan terakhir
      const memberResponse = await axios.get(`${MEMBERS_API_URL}/${memberId}`);
      const member = memberResponse.data;
      
      const currentVisits = member.total_visits || 0;
      const newTotalVisits = currentVisits + 1;
      
      await axios.put(`${MEMBERS_API_URL}/${memberId}`, {
        total_visits: newTotalVisits,
        last_visit: appointment.date
      });
      
      // Update state members lokal
      setMembers(prevMembers => 
        prevMembers.map(m => 
          m.id == memberId 
            ? { ...m, total_visits: newTotalVisits, last_visit: appointment.date }
            : m
        )
      );
      
      // 2. Tambahkan ke riwayat member
      await addToMemberHistory(appointment);
      
      console.log(`Memperbarui data member ${memberId} dan riwayat`);
      
    } catch (err) {
      console.error('Error memperbarui data member:', err);
    }
  };

  // --- UPDATE STATISTIK TERAPIS ---
  const updateTherapistStatistics = async (therapistName, oldStatus, newStatus) => {
    try {
      if (!therapistName) return;
      
      // Cari terapis berdasarkan nama
      const therapist = therapists.find(t => t.name === therapistName);
      if (!therapist) {
        console.error('Terapis tidak ditemukan:', therapistName);
        return;
      }

      // Update statistik terapis di server
      await axios.put(`${THERAPISTS_API_URL}/${therapist.id}`, {
        total_confirmed: calculateTherapistConfirmed(therapist, oldStatus, newStatus),
        total_completed: calculateTherapistCompleted(therapist, oldStatus, newStatus),
        total_treatments: newStatus === 'completed' ? (therapist.total_treatments || 0) + 1 : therapist.total_treatments
      });

      // Refresh data terapis
      const therapistsResponse = await axios.get(THERAPISTS_API_URL);
      setTherapists(therapistsResponse.data);
      
    } catch (err) {
      console.error('Error memperbarui statistik terapis:', err);
    }
  };

  // Fungsi helper untuk menghitung statistik terapis
  const calculateTherapistConfirmed = (therapist, oldStatus, newStatus) => {
    let confirmed = therapist.total_confirmed || 0;
    
    if (oldStatus === 'confirmed' && newStatus !== 'confirmed') {
      confirmed = Math.max(0, confirmed - 1);
    } else if (oldStatus !== 'confirmed' && newStatus === 'confirmed') {
      confirmed = confirmed + 1;
    } else if (!oldStatus && newStatus === 'confirmed') {
      confirmed = confirmed + 1; // Saat membuat baru
    }
    
    return confirmed;
  };

  const calculateTherapistCompleted = (therapist, oldStatus, newStatus) => {
    let completed = therapist.total_completed || 0;
    
    if (oldStatus === 'completed' && newStatus !== 'completed') {
      completed = Math.max(0, completed - 1);
    } else if (oldStatus !== 'completed' && newStatus === 'completed') {
      completed = completed + 1;
    } else if (!oldStatus && newStatus === 'completed') {
      completed = completed + 1; // Saat membuat baru
    }
    
    return completed;
  };

  // --- AKSI CEPAT STATUS ---
  const handleQuickStatusUpdate = async (id, currentStatus) => {
    let nextStatus;
    
    // Tentukan status berikutnya berdasarkan status saat ini
    if (currentStatus === 'confirmed') {
      nextStatus = 'completed';
    } else if (currentStatus === 'completed') {
      // Jika ingin bisa kembali ke confirmed (opsional)
      nextStatus = 'confirmed';
    }
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) return;
      
      console.log(`Memperbarui appointment ${id} dari ${currentStatus} ke ${nextStatus}`);
      
      // Update status appointment di database
      const response = await axios.put(`${APPOINTMENTS_API_URL}/${id}/complete`, {
        status: nextStatus
      }, { headers: { Authorization: `Bearer ${Token}` } });
      
      const updatedAppointment = response.data;
      
      // Update state lokal
      const updatedAppointments = appointments.map(app => 
        app.id === id ? { ...app, status: nextStatus } : app
      );
      setAppointments(updatedAppointments);
      
      // Update statistik
      calculateStatistics(updatedAppointments);
      
      // Update statistik terapis
      if (appointment.therapist) {
        await updateTherapistStatistics(appointment.therapist, currentStatus, nextStatus);
      }
      
      // Jika status berubah menjadi 'completed', update riwayat member
      if (nextStatus === 'completed' && currentStatus !== 'completed') {
        if (appointment.member_id) {
          await updateMemberData(appointment.member_id, appointment);
        }
      }
      
      console.log(`Status diperbarui dari ${currentStatus} ke ${nextStatus} untuk appointment ${id}`);
      
    } catch (err) { 
      alert("Gagal memperbarui status"); 
      console.error('Error memperbarui status appointment:', err);
    } finally { 
      setActionLoading(prev => ({ ...prev, [id]: false })); 
    }
  };

  // --- LOGIKA PENCARIAN MEMBER ---
  const filteredMembersResults = useMemo(() => {
    if (!memberSearch) return [];
    
    // Pastikan members memiliki property data
    const membersList = members.data || members || [];
    if (!Array.isArray(membersList)) return [];
       
    return membersList.filter(m => 
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.id.toString().includes(memberSearch)
    ).slice(0, 5);
  }, [members, memberSearch]);

  const selectMember = (member) => {
    setFormData({ ...formData, member_id: member.id, member_id: member.id, customer_name: member.name });
    setMemberSearch(member.name);
    setShowSearchDropdown(false);
  };

  const filteredAppointments = useMemo(() => {
    if (selectedStatus === 'all') return appointments;
    return appointments.filter(app => app.status === selectedStatus);
  }, [appointments, selectedStatus]);

  // --- HANDLERS ---
  const handleAdd = () => {
    setIsAdding(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setFormData({
      customer_name: '', member_id: '', member_id: '', treatment: '', treatment_id: '', therapist: '', therapist_id: '',
      date: today,
      time: time, amount: 0, status: 'confirmed'
    });
    setAmountInput('0');
    setMemberSearch('');
  };

  const handleEdit = (app) => {
    setEditingAppointment(app.id);
    
    // Map data dari database ke form
    setFormData({ 
      customer_name: app.customer_name || '',
      member_id: app.member_id || app.member_id || '',
      member_id: app.member_id || app.member_id || '',
      treatment: app.treatment_name || app.treatment || '',
      treatment_id: app.treatment_id || '',
      therapist: app.therapist_name || app.therapist || '',
      therapist_id: app.therapist_id || '',
      date: app.date || '',
      time: app.time || '',
      amount: parseFloat(app.amount) || 0,
      status: app.status || 'confirmed'
    });
    setAmountInput(app.amount.toString());
    setMemberSearch(app.customer_name || '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setFormData({ ...formData, amount: parseFloat(value) || 0 });
      setAmountInput(value);
    } else if (name === 'treatment') {
      const treatmentsList = treatments.data || treatments || [];
      const tr = treatmentsList.find(t => t.name === value);
      setFormData({ 
        ...formData, 
        treatment: value,
        treatment_id: tr ? tr.id : '',
        amount: tr ? tr.price : 0 
      });
      setAmountInput(tr ? tr.price.toString() : '0');
    } else if (name === 'therapist') {
      const therapistsList = therapists.data || therapists || [];
      const th = therapistsList.find(t => t.name === value);
      setFormData({ 
        ...formData, 
        therapist: value,
        therapist_id: th ? th.id : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.customer_name.trim()) {
      alert('Nama pelanggan wajib diisi');
      return;
    }
    
    if (!formData.treatment.trim()) {
      alert('Perawatan wajib diisi');
      return;
    }
    
    if (!formData.therapist.trim()) {
      alert('Terapis wajib diisi');
      return;
    }

    try {
      // Siapkan data untuk dikirim ke API dengan ID
      const dataToSend = {
        member_id: formData.member_id || formData.member_id,
        customer_name: formData.customer_name,
        treatment_id: formData.treatment_id,
        therapist_id: formData.therapist_id,
        date: formData.date,
        time: formData.time,
        amount: formData.amount,
        status: formData.status
      };

      let response;
      if (isAdding) {
        // Buat appointment baru
        response = await axios.post(APPOINTMENTS_API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const newAppointment = response.data.data || response.data;
        const updatedAppointments = [newAppointment, ...appointments];
        setAppointments(updatedAppointments);
        calculateStatistics(updatedAppointments);
        
        // Update statistik terapis untuk appointment baru
        if (formData.therapist) {
          await updateTherapistStatistics(formData.therapist, null, formData.status);
        }
        
        setIsAdding(false);
        
        // Jika status completed saat membuat, update riwayat member
        if (formData.status === 'completed' && formData.member_id) {
          await updateMemberData(formData.member_id, newAppointment);
        }
      } else {
        // Update appointment yang ada
        const oldAppointment = appointments.find(a => a.id === editingAppointment);
        
        response = await axios.put(`${APPOINTMENTS_API_URL}/${editingAppointment}`, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const updatedAppointment = response.data.data || response.data;
        const updatedAppointments = appointments.map(app => 
          app.id === editingAppointment ? updatedAppointment : app
        );
        setAppointments(updatedAppointments);
        calculateStatistics(updatedAppointments);
        
        // Update statistik terapis jika status atau terapis berubah
        const oldTherapistName = oldAppointment?.therapist_name || oldAppointment?.therapist;
        const newTherapistName = formData.therapist;
        
        if (oldAppointment && (oldAppointment.status !== formData.status || oldTherapistName !== newTherapistName)) {
          // Kurangi statistik terapis lama
          if (oldTherapistName) {
            await updateTherapistStatistics(oldTherapistName, oldAppointment.status, null);
          }
          
          // Tambah statistik terapis baru
          if (newTherapistName) {
            await updateTherapistStatistics(newTherapistName, null, formData.status);
          }
        }
        
        // Jika status berubah menjadi completed, update riwayat member
        if (oldAppointment?.status !== 'completed' && formData.status === 'completed' && formData.member_id) {
          await updateMemberData(formData.member_id, updatedAppointment);
        }
      }
      
      handleCancel();
    } catch (err) { 
      alert("Gagal menyimpan"); 
      console.error('Error menyimpan appointment:', err);
    }
  };

  const handleCancel = () => {
    setEditingAppointment(null);
    setIsAdding(false);
    setMemberSearch('');
  };

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(val || 0);

  // Format tanggal untuk ditampilkan
  const formatDisplayDate = (dateStr, timeStr) => {
    try {
      return `${dateStr}, ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Dapatkan warna status
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'confirmed';
    switch(normalizedStatus) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dapatkan teks status dalam bahasa Indonesia
  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': 'Dikonfirmasi',
      'completed': 'Selesai'
    };
    return statusMap[status] || status;
  };

  // Loading state
  const isLoading = Object.values(loading).some(l => l === true);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data appointment...</p>
        </div>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
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
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Janji Temu</h1>
          <p className="text-gray-600">Kelola, konfirmasi, dan selesaikan perawatan janji temu.</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="bg-brown-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brown-700 transition-colors duration-200"
        >
          + Tambah Janji Temu
        </button>
      </div>

      {/* Statistik Janji Temu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed_count}</div>
              <div className="text-sm text-gray-600">Dikonfirmasi</div>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">✓</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Janji temu disetujui</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed_count}</div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">★</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Perawatan selesai (Ditambahkan ke Riwayat)</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.total_count}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">∑</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Semua janji temu</div>
        </div>
      </div>

      {/* Legenda Status & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">Dikonfirmasi</span>
                <div className="text-[10px] text-gray-500 leading-none">Janji temu disetujui</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">Selesai</span>
                <div className="text-[10px] text-gray-500 leading-none">Perawatan selesai (Ditambahkan ke Riwayat)</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="completed">Selesai</option>
            </select>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200"
            >
              Segarkan
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Pendapatan */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-4 border border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Ringkasan Pendapatan</h3>
            <div className="text-xs text-gray-600">Hanya janji temu yang selesai</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">{formatRupiah(stats.completed_revenue)}</div>
            <div className="text-xs text-gray-600">Total Pendapatan</div>
          </div>
        </div>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 uppercase text-[10px] font-black tracking-widest">
                <th className="p-4">ID</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Perawatan</th>
                <th className="p-4">Jadwal</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Aksi Cepat</th>
                <th className="p-4 text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-400">Tidak ada janji temu ditemukan</p>
                      {selectedStatus !== 'all' && (
                        <button 
                          onClick={() => setSelectedStatus('all')}
                          className="mt-2 text-brown-600 hover:text-brown-700 text-sm"
                        >
                          Tampilkan semua janji temu
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-600">
                      {app.appointment_id || `APT-${app.id}`}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{app.customer_name}</div>
                      {app.member_id && (
                        <div className="text-[10px] text-gray-500">
                          ID Member: {app.member_id}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div>{app.treatment_category}</div>
                      <div className="text-[10px] text-brown-600 font-bold uppercase">{app.therapist_name}</div>
                    </td>
                    <td className="p-4 text-gray-500">
                      <div>{formatDisplayDate(app.date, app.time)}</div>
                    </td>
                    <td className="p-4 font-bold text-green-700">
                      {formatRupiah(app.amount)}
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase ${
                        getStatusColor(app.status)
                      }`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        {app.status === 'confirmed' && (
                          <button 
                            onClick={() => handleQuickStatusUpdate(app.id, 'confirmed')} 
                            disabled={actionLoading[app.id]}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                          >
                            {actionLoading[app.id] ? 'Memproses...' : 'Selesaikan'}
                          </button>
                        )}
                        {app.status === 'completed' && (
                          <span className="text-green-500 text-[10px] font-bold italic tracking-wider px-2 py-1">
                            SELESAI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(app)} 
                          className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-600 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => { 
                            if(window.confirm('Apakah Anda yakin ingin menghapus janji temu ini?')) {
                              try {
                                const token = localStorage.getItem('token');

                                await axios.delete(`${APPOINTMENTS_API_URL}/${app.id}`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                const updatedAppointments = appointments.filter(a => a.id !== app.id);
                                setAppointments(updatedAppointments);
                                calculateStatistics(updatedAppointments);
                                
                                // Update statistik terapis untuk pengurangan
                                if (app.therapist_name) {
                                  await updateTherapistStatistics(app.therapist, app.status, null);
                                }
                              } catch (err) {
                                console.error('Error menghapus:', err);
                                alert('Gagal menghapus janji temu');
                              }
                            }
                          }} 
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-red-600 transition-colors duration-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {(editingAppointment || isAdding) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{isAdding ? 'Booking Baru' : 'Perbarui Booking'}</h3>
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-left">
              {/* Cari Member */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Cari Member
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                  value={memberSearch}
                  onChange={(e) => { 
                    const value = e.target.value;
                    setMemberSearch(value); 
                    setFormData({ ...formData, customer_name: value });
                    setShowSearchDropdown(true); 
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Ketik nama atau ID..."
                />
                <div className="text-xs text-gray-500 mt-1">Cari berdasarkan nama atau ID member</div>
                {showSearchDropdown && filteredMembersResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredMembersResults.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => selectMember(m)} 
                        className="p-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-gray-500">ID: {m.id} | Kunjungan: {m.total_visits || 0}</div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Pilih
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tanggal */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Tanggal Janji Temu
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                />
                <div className="text-xs text-gray-500">Pilih tanggal janji temu</div>
              </div>

              {/* Waktu */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Waktu Janji Temu
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                />
                <div className="text-xs text-gray-500">Pilih waktu janji temu</div>
              </div>

              {/* Perawatan */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pilih Perawatan
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select 
                  name="treatment" 
                  value={formData.treatment} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                >
                  <option value="">Pilih Perawatan</option>
                  {(treatments.data || treatments || []).map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} - {formatRupiah(t.price)}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">Pilih jenis perawatan</div>
              </div>

              {/* Terapis */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pilih Terapis
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select 
                  name="therapist" 
                  value={formData.therapist} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                >
                  <option value="">Pilih Terapis</option>
                  {(therapists.data || therapists || []).map(th => (
                    <option key={th.id} value={th.name}>
                      {th.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">Pilih terapis</div>
              </div>

              {/* Jumlah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Jumlah Perawatan (IDR)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="number" 
                  name="amount" 
                  value={amountInput} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-green-700 focus:ring-2 focus:ring-brown-500 outline-none" 
                  min="0"
                />
                <div className="text-xs text-gray-500">Masukkan jumlah perawatan dalam IDR</div>
                <div className="text-sm font-bold text-green-700">
                  {formatRupiah(formData.amount)}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Status Janji Temu
                </label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brown-500 outline-none"
                >
                  <option value="confirmed">Dikonfirmasi - Janji temu disetujui</option>
                  <option value="completed">Selesai - Perawatan selesai</option>
                </select>
                
                <div className="text-xs text-gray-500">
                  Catatan: Mengubah status akan memperbarui statistik terapis
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button 
                onClick={handleCancel} 
                className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-md transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-2 bg-brown-600 text-white rounded-md font-bold hover:bg-brown-700 transition-colors"
              >
                {isAdding ? 'Buat Janji Temu' : 'Perbarui Janji Temu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;