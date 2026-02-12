import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Treatment = () => {
  const [treatments, setTreatments] = useState([]);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    price: '0',
    description: '',
    image: '',
    facilities: [] // Array untuk fasilitas
  });
  const [newFacility, setNewFacility] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // API base URL
  const API_URL = 'http://localhost:5000/api/treatments';

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Ambil data treatments dari API
  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const Token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      setTreatments(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat perawatan. Silakan coba lagi.');
      console.error('Error memuat perawatan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return 'Rp ' + number.toLocaleString('id-ID');
  };

  // Parse Rupiah
  const parseRupiah = (rupiah) => {
    return parseInt(rupiah.toString().replace(/\D/g, '')) || 0;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      category: '',
      duration: '',
      price: '0',
      description: '',
      image: '',
      facilities: []
    });
    setNewFacility('');
    setPreviewImage(null);
    setActiveTab('details');
  };

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment._id || treatment.id);
    setIsAdding(false);
    setFormData({
      ...treatment,
      price: String(parseInt(treatment.price) || 0),
      facilities: treatment.facilities || []
    });
    setNewFacility('');
    setPreviewImage(treatment.image);
    setActiveTab('details');
  };

  // Handle Tambah Fasilitas
  const handleAddFacility = () => {
    if (!newFacility.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama fasilitas wajib diisi'
      });
      return;
    }

    setFormData({
      ...formData,
      facilities: [...formData.facilities, newFacility.trim()]
    });

    setNewFacility('');
  };

  // Handle Hapus Fasilitas
  const handleRemoveFacility = (index) => {
    const updatedFacilities = formData.facilities.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      facilities: updatedFacilities
    });
  };

  // Handle Perubahan Fasilitas
  const handleFacilityChange = (index, value) => {
    const updatedFacilities = [...formData.facilities];
    updatedFacilities[index] = value;
    setFormData({
      ...formData,
      facilities: updatedFacilities
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || !formData.duration) {
        setNotification({
          show: true,
          type: 'error',
          title: 'Validasi Gagal',
          message: 'Harap isi semua bidang yang wajib diisi'
        });
        return;
      }

      const priceValue = parseRupiah(formData.price);
      const treatmentData = {
        name: formData.name,
        category: formData.category,
        duration: formData.duration,
        price: priceValue,
        description: formData.description || '',
        image: previewImage || formData.image || '',
        facilities: formData.facilities.filter(facility => facility.trim() !== '')
      };

      const Token = localStorage.getItem('token');
      
      if (isAdding) {
        const response = await axios.post(API_URL, treatmentData, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const newTreatment = response.data.data || response.data;
        setTreatments([newTreatment, ...treatments]);
        setIsAdding(false);
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Perawatan baru berhasil ditambahkan'
        });
      } else {
        const response = await axios.put(`${API_URL}/${editingTreatment}`, treatmentData, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        const updatedTreatment = response.data.data || response.data;
        setTreatments(treatments.map(treatment =>
          (treatment._id || treatment.id) === editingTreatment ? updatedTreatment : treatment
        ));
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Data perawatan berhasil diperbarui'
        });
      }

      handleCancel();
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || 'Gagal menyimpan perawatan. Silakan coba lagi.'
      });
      console.error('Error menyimpan perawatan:', err);
    }
  };

  const handleCancel = () => {
    setEditingTreatment(null);
    setIsAdding(false);
    setFormData({
      name: '',
      category: '',
      duration: '',
      price: '0',
      description: '',
      image: '',
      facilities: []
    });
    setNewFacility('');
    setPreviewImage(null);
    setActiveTab('details');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus perawatan ini?')) {
      try {
        const Token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${Token}` }
        });
        setTreatments(treatments.filter(treatment => (treatment._id || treatment.id) !== id));
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Perawatan berhasil dihapus dari sistem'
        });
      } catch (err) {
        setNotification({
          show: true,
          type: 'error',
          title: 'Gagal Menghapus',
          message: err.response?.data?.message || 'Gagal menghapus perawatan. Silakan coba lagi.'
        });
        console.error('Error menghapus perawatan:', err);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setPreviewImage(e.target.value);
    setFormData({ ...formData, image: e.target.value });
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, image: '' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
      </div>
    );
  }

  // Error state
  if (error && (!Array.isArray(treatments) || treatments.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Perawatan</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTreatments}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Perawatan</h1>
          <p className="text-gray-600">Kelola perawatan dan layanan yang tersedia.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Perawatan
        </button>
      </div>

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

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Cari perawatan berdasarkan nama, kategori, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Menampilkan {Array.isArray(treatments) && treatments.filter(treatment => 
              (treatment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (treatment.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (treatment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (treatment.duration || '').toLowerCase().includes(searchTerm.toLowerCase())
            ).length} dari {treatments.length} perawatan
          </p>
        )}
      </div>

      {/* Treatments Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(treatments) && treatments
          .filter(treatment => 
            (treatment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (treatment.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (treatment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (treatment.duration || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((treatment) => (
          <div key={treatment._id || treatment.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Treatment Image */}
            <div className="h-48 bg-gray-100 relative">
              {treatment.image ? (
                <img
                  src={treatment.image}
                  alt={treatment.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Perawatan';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-brown-100 text-brown-800 rounded-full text-xs font-medium">
                  {treatment.category}
                </span>
              </div>
            </div>

            {/* Treatment Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{treatment.name}</h3>
                <span className="text-lg font-bold text-brown-600">
                  {formatRupiah(treatment.price)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{treatment.description}</p>

              {/* Facilities Preview */}
              {treatment.facilities && treatment.facilities.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Termasuk:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {treatment.facilities.slice(0, 3).map((facility, index) => (
                      <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        {facility}
                      </span>
                    ))}
                    {treatment.facilities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{treatment.facilities.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {treatment.duration}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(treatment)}
                  className="flex-1 px-3 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(treatment._id || treatment.id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {(editingTreatment || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {isAdding ? 'Tambah Perawatan Baru' : 'Edit Perawatan'}
            </h3>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                    ? 'border-brown-500 text-brown-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Detail Perawatan
                </button>
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'facilities'
                    ? 'border-brown-500 text-brown-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Fasilitas ({formData.facilities.length})
                </button>
              </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'details' ? (
              <>
                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Perawatan</label>

                  {/* Image Preview */}
                  <div className="mb-4 flex justify-center">
                    <div className="w-64 h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      {previewImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">Unggah gambar perawatan</span>
                          <span className="text-xs mt-1">Rekomendasi: 800x600 px</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="space-y-3">
                    {/* Upload from Computer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Gambar</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF maksimal 5MB</p>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ATAU</span>
                      </div>
                    </div>

                    {/* Image URL Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                      <input
                        type="text"
                        value={previewImage || ''}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/gambar-perawatan.jpg"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Treatment Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Perawatan</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Masukkan nama perawatan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kategori</label>
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="Perawatan Wajah">Perawatan Wajah</option>
                        <option value="Perawatan Tubuh">Perawatan Tubuh</option>
                        <option value="Perawatan Khusus">Perawatan Khusus</option>
                        <option value="Paket Spesial">Paket Spesial</option>
                        <option value="Perawatan Promo">Perawatan Promo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durasi</label>
                      <select
                        name="duration"
                        value={formData.duration || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Pilih Durasi</option>
                        <option value="30 menit">30 menit</option>
                        <option value="45 menit">45 menit</option>
                        <option value="60 menit">60 menit</option>
                        <option value="90 menit">90 menit</option>
                        <option value="120 menit">120 menit</option>
                        <option value="150 menit">150 menit</option>
                        <option value="180 menit">180 menit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Harga</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rp</span>
                      </div>
                      <input
                        type="text"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md pl-10 pr-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Harga akhir akan ditampilkan sebagai: {formatRupiah(formData.price)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows="4"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Jelaskan detail perawatan, manfaat, dll."
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Facilities Tab */
              <div className="space-y-4">
                {/* Add New Facility Form */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Tambah Fasilitas</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newFacility}
                      onChange={(e) => setNewFacility(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="cth: Facial Wash, Deep Masker, Head Massage"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFacility()}
                    />
                    <button
                      onClick={handleAddFacility}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Tambah
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tekan Enter atau klik Tambah untuk menambahkan fasilitas
                  </p>
                </div>

                {/* Facilities List */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Fasilitas yang Termasuk ({formData.facilities.length})
                  </h4>

                  {formData.facilities.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">Belum ada fasilitas ditambahkan.</p>
                      <p className="text-sm text-gray-400">Tambahkan fasilitas yang akan didapatkan pelanggan selama perawatan ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.facilities.map((facility, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <input
                                type="text"
                                value={facility}
                                onChange={(e) => handleFacilityChange(index, e.target.value)}
                                className="font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                                placeholder="Nama fasilitas"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveFacility(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                {activeTab === 'facilities' && (
                  <span>{formData.facilities.length} fasilitas termasuk</span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
                {activeTab === 'details' ? (
                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Selanjutnya: Tambah Fasilitas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('details')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Kembali ke Detail
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
                    >
                      {isAdding ? 'Tambah Perawatan' : 'Simpan Perubahan'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {Array.isArray(treatments) && treatments.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada perawatan ditemukan</h3>
          <p className="text-gray-500 mb-6">Mulai dengan menambahkan perawatan pertama Anda ke klinik.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
          >
            Tambah Perawatan
          </button>
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

export default Treatment;