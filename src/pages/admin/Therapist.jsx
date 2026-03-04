import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Therapist = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    join_date: '' // UBAH dari joinDate menjadi join_date
  });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingDetails, setViewingDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

  // API base URL
  const API_URL = 'http://localhost:5000/api/therapists';
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';

  const Token = localStorage.getItem('token');

  // Ambil data terapis dan appointments dari API
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-hide notification after 3 seconds
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
      setError(null);

      const [therapistsResponse, appointmentsResponse] = await Promise.all([
        axios.get(API_URL, {
          headers: { Authorization: `Bearer ${Token}` }
        }),
        axios.get(APPOINTMENTS_API_URL, {
          headers: { Authorization: `Bearer ${Token}` }
        })
      ]);

      console.log('Therapists from API:', therapistsResponse.data); // DEBUG
      console.log('Appointments from API:', appointmentsResponse.data); // DEBUG

      // Extract array from response
      const therapistsData = therapistsResponse.data?.data || therapistsResponse.data || [];
      const appointmentsData = appointmentsResponse.data?.data || appointmentsResponse.data || [];

      setTherapists(Array.isArray(therapistsData) ? therapistsData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setAppointmentsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
      setTherapists([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghitung total perawatan dari appointments
  const calculateTherapistTreatments = (therapistId) => {
    if (!therapistId || !Array.isArray(appointments)) return 0;
    
    return appointments.filter(app => 
      app.therapist_id === therapistId &&
      app.status === 'completed'
    ).length;
  };

  // Fungsi untuk mendapatkan riwayat appointment terapis
  const getAppointmentsByTherapist = (therapistId) => {
    if (!therapistId || !Array.isArray(appointments)) return [];
    
    return appointments.filter(app =>
      app.therapist_id === therapistId &&
      app.status === 'completed'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Fungsi untuk menghitung total pendapatan dari appointments terapis
  const calculateTherapistRevenue = (therapistId) => {
    const therapistAppointments = getAppointmentsByTherapist(therapistId);
    return therapistAppointments.reduce((total, app) => total + (parseFloat(app.amount) || 0), 0);
  };

  // Hitung statistik keseluruhan - UBAH dari therapist.name menjadi therapist.id
  const stats = {
    total: therapists.length,
    active: therapists.filter(t => t.status === 'active').length,
    totalTreatments: therapists.reduce((sum, therapist) => 
      sum + calculateTherapistTreatments(therapist.id), 0),
    newThisMonth: therapists.filter(t => {
      const joinDate = t.join_date || t.joinDate;
      if (!joinDate) return false;
      try {
        const joinMonth = new Date(joinDate).getMonth();
        const currentMonth = new Date().getMonth();
        const joinYear = new Date(joinDate).getFullYear();
        const currentYear = new Date().getFullYear();
        return joinMonth === currentMonth && joinYear === currentYear;
      } catch {
        return false;
      }
    }).length,
    totalRevenue: therapists.reduce((sum, therapist) => 
      sum + calculateTherapistRevenue(therapist.id), 0)
  };

  // Filter terapis
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch =
      (therapist.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (therapist.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (therapist.phone || '').includes(searchTerm) ||
      (therapist.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || therapist.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setIsAdding(true);
    setEditingTherapist(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      join_date: new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })
    });
    setError(null);
  };

  const handleEdit = (therapist) => {
    setEditingTherapist(therapist.id);
    setIsAdding(false);
    setFormData({
      name: therapist.name || '',
      email: therapist.email || '',
      phone: therapist.phone || '',
      status: therapist.status || 'active',
      join_date: therapist.join_date || '' // UBAH dari joinDate menjadi join_date
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      // Validasi
      if (!formData.name || !formData.email) {
        setError('Nama dan Email wajib diisi');
        setSaveLoading(false);
        return;
      }

      const dataToSend = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        status: formData.status,
        join_date: formData.join_date || null // UBAH dari joinDate menjadi join_date
      };

      if (isAdding) {
        const response = await axios.post(API_URL, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        setTherapists([...therapists, response.data]);
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Terapis baru berhasil ditambahkan'
        });
      } else {
        const response = await axios.put(`${API_URL}/${editingTherapist}`, dataToSend, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        setTherapists(therapists.map(t => t.id === editingTherapist ? response.data : t));
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Data terapis berhasil diperbarui'
        });
      }

      setEditingTherapist(null);
      setIsAdding(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'active',
        join_date: '' // UBAH dari joinDate menjadi join_date
      });
    } catch (error) {
      console.error('Error saving therapist:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan data terapis');
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: error.response?.data?.message || 'Gagal menyimpan data terapis'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingTherapist(null);
    setIsAdding(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active',
      join_date: '' // UBAH dari joinDate menjadi join_date
    });
    setError(null);
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/${showDeleteConfirm}`, {
        headers: {Authorization: `Bearer ${Token}`}
      });
      setTherapists(therapists.filter(therapist => 
        therapist.id !== showDeleteConfirm
      ));
      setShowDeleteConfirm(null);
      setError(null);
      setNotification({
        show: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Terapis berhasil dihapus dari sistem'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menghapus terapis';
      setError(errorMessage);
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: errorMessage
      });
      console.error('Error menghapus terapis:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleView = (therapist) => {
    navigate(`/admin/therapist/${therapist.id}`);
  };

  // Format mata uang
  const formatRupiah = (val) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data terapis...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && therapists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Terapis</h3>
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
          <div className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        </div>
      )}

      {/* Page Title and Stats */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Terapis</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola profil terapis dan riwayat perawatan.</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm sm:text-base rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Memuat...' : 'Tambah Terapis'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Terapis</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs sm:text-sm text-gray-600">Aktif</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalTreatments}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Perawatan</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-base sm:text-2xl font-bold text-purple-600">{formatRupiah(stats.totalRevenue)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Pendapatan</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Cari terapis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
              <option value="on_leave">Cuti</option>
            </select>
          </div>
        </div>
      </div>

      {/* Therapists Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Terapis</h2>
          <span className="text-sm text-gray-500">
            Menampilkan {filteredTherapists.length} dari {therapists.length} terapis
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat terapis...</p>
          </div>
        ) : filteredTherapists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Terapis</th>
                  <th className="pb-3 font-medium">Kontak</th>
                  <th className="pb-3 font-medium">Perawatan</th>
                  <th className="pb-3 font-medium">Pendapatan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tanggal Bergabung</th>
                  <th className="pb-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.map((therapist) => {
                  const totalTreatments = calculateTherapistTreatments(therapist.id); // UBAH
                  const totalRevenue = calculateTherapistRevenue(therapist.id); // UBAH

                  return (
                    <tr key={therapist.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3">
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {therapist.therapist_id || therapist.id}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-brown-600">
                              {(therapist.name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{therapist.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm text-gray-600">{therapist.email || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{therapist.phone || 'N/A'}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-lg font-bold text-gray-800">
                          {totalTreatments}
                        </div>
                        <div className="text-xs text-gray-400">perawatan selesai</div>
                      </td>
                      <td className="py-3">
                        <div className="text-lg font-bold text-green-700">
                          {formatRupiah(totalRevenue)}
                        </div>
                        <div className="text-xs text-gray-400">total pendapatan</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${therapist.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : therapist.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {therapist.status === 'active' ? 'Aktif' : 
                           therapist.status === 'inactive' ? 'Tidak Aktif' : 
                           therapist.status === 'on_leave' ? 'Cuti' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {therapist.join_date || 'N/A'}
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(therapist)}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors duration-200"
                          >
                            Lihat
                          </button>
                          <button
                            onClick={() => handleEdit(therapist)}
                            className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(therapist.id)}
                            className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 text-xs rounded-lg hover:bg-red-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada terapis ditemukan</h3>
            <p className="text-gray-500 mb-6">Coba sesuaikan pencarian atau kriteria filter Anda.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Tambah Terapis Baru
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - FIXED */}
      {(editingTherapist || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              {isAdding ? 'Tambah Terapis Baru' : 'Edit Terapis'}
            </h3>

            <div className="space-y-3 sm:space-y-4">
              {/* Therapist ID Field - Visible only when editing */}
              {!isAdding && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Terapis
                  </label>
                  <input
                    type="text"
                    name="therapist_id"
                    value={therapists.find(t => t.id === editingTherapist)?.therapist_id || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="terapis@klinik.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="081234567890"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="on_leave">Cuti</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tanggal Bergabung
                  </label>
                  <input
                    type="text"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="01 Jan 2024"
                  />
                </div>
              </div>

              <div className="text-[10px] sm:text-xs text-gray-500">
                <p>Format tanggal bergabung: DD MMM YYYY (contoh: 25 Des 2024)</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center ${
                  isAdding
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : isAdding ? (
                  'Tambah Terapis'
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
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Hapus Terapis</h3>
            <p className="text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus terapis ini?
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
                  'Hapus Terapis'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{viewingDetails.name}</h3>
                <p className="text-sm text-gray-600">ID: {viewingDetails.therapist_id || viewingDetails.id}</p>
              </div>
              <button
                onClick={() => setViewingDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Avatar</label>
                  <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center mt-2">
                    <span className="text-2xl font-medium text-brown-600">
                      {(viewingDetails.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Informasi Kontak</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{viewingDetails.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{viewingDetails.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Tanggal Bergabung</label>
                  <div className="text-gray-600 mt-1">
                    {viewingDetails.join_date || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewingDetails.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : viewingDetails.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {viewingDetails.status === 'active' ? 'Aktif' : 
                       viewingDetails.status === 'inactive' ? 'Tidak Aktif' : 
                       viewingDetails.status === 'on_leave' ? 'Cuti' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Statistics & Appointment History */}
              <div className="space-y-4">
                {/* Statistics */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Statistik Perawatan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {calculateTherapistTreatments(viewingDetails.id)}
                      </div>
                      <div className="text-sm text-gray-600">Total Perawatan</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {formatRupiah(calculateTherapistRevenue(viewingDetails.id))}
                      </div>
                      <div className="text-sm text-gray-600">Total Pendapatan</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Set(getAppointmentsByTherapist(viewingDetails.id).map(app => app.treatment)).size}
                      </div>
                      <div className="text-sm text-gray-600">Jenis Perawatan Berbeda</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(getAppointmentsByTherapist(viewingDetails.id).map(app => app.customer_name || app.member_id)).size}
                      </div>
                      <div className="text-sm text-gray-600">Pasien Unik</div>
                    </div>
                  </div>
                </div>

                {/* Appointment History */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Perawatan Terbaru</label>
                  <div className="max-h-60 overflow-y-auto">
                    {appointmentsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brown-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Memuat janji temu...</p>
                      </div>
                    ) : getAppointmentsByTherapist(viewingDetails.id).length > 0 ? (
                      <div className="space-y-2">
                        {getAppointmentsByTherapist(viewingDetails.id)
                          .slice(0, 10)
                          .map((appointment, index) => (
                            <div key={appointment.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-gray-800">{appointment.customer_name || 'N/A'}</div>
                                  <div className="text-sm text-gray-600">ID: {appointment.appointment_id}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-green-700">
                                    {formatRupiah(appointment.amount)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{appointment.date || 'N/A'} {appointment.time || ''}</span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {appointment.status === 'completed' ? 'Selesai' : appointment.status || 'Selesai'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Belum ada perawatan yang selesai
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingDetails(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`mt-1 text-sm ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-4 flex-shrink-0 rounded-md inline-flex ${
                  notification.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'
                }`}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Therapist;