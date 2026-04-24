import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Preloader from '../../components/common/Preloader';

const Treatment = () => {
  const [treatments, setTreatments] = useState([]);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: [], // Array untuk multiple kategori
    duration: '',
    price: '0',
    description: '',
    image: '',
    facilities: [], // Array untuk fasilitas
    discountPercentage: 0,
    promoStartDate: '',
    promoEndDate: ''
  });
  const [newFacility, setNewFacility] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Filter kategori
  
  const defaultCategories = [
    'Perawatan Wajah', 
    'Perawatan Tubuh', 
    'Perawatan Khusus', 
    'Paket Spesial', 
    'Perawatan Promo'
  ];
  
  const defaultFacilities = [
    'Facial Wash',
    'Deep Cleansing',
    'Facial Massage',
    'Head Massage',
    'Shoulder Massage',
    'Masker Wajah',
    'Scrub',
    'Serum Treatment',
    'Totok Wajah',
    'Face Toning',
    'Aromaterapi',
    'Hand Treatment',
    'Foot Spa'
  ];
  
  // State untuk kategori dan fasilitas (akan diload dari database)
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // API base URL
  const API_URL = '/api/treatments';
  const OPTIONS_API_URL = '/api/treatment-options';

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Ambil data treatments dan options dari API
  useEffect(() => {
    fetchTreatments();
    fetchCategories();
    fetchFacilities();
  }, []);

  // Fetch categories dari database
  const fetchCategories = async () => {
    try {
      const Token = localStorage.getItem('token');
      const response = await axios.get(`${OPTIONS_API_URL}/categories`, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      setAvailableCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAvailableCategories(defaultCategories); // Fallback to default
    }
  };

  // Fetch facilities dari database
  const fetchFacilities = async () => {
    try {
      const Token = localStorage.getItem('token');
      const response = await axios.get(`${OPTIONS_API_URL}/facilities`, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      setAvailableFacilities(response.data.data || []);
      setLoadingOptions(false);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setAvailableFacilities(defaultFacilities); // Fallback to default
      setLoadingOptions(false);
    }
  };

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
    return 'Rp ' + number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Parse Rupiah
  const parseRupiah = (rupiah) => {
    return parseInt(rupiah.toString().replace(/\D/g, '')) || 0;
  };

  // Fungsi untuk cek apakah promo aktif
  const isPromoActive = (treatment) => {
    if (!treatment.discount_percentage || treatment.discount_percentage <= 0) return false;
    if (!treatment.promo_start_date || !treatment.promo_end_date) return false;
    
    const now = new Date();
    const startDate = new Date(treatment.promo_start_date);
    const endDate = new Date(treatment.promo_end_date);
    
    return now >= startDate && now <= endDate;
  };

  // Fungsi untuk hitung harga setelah diskon
  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discount = (price * discountPercentage) / 100;
    return price - discount;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      category: [], // Array untuk multiple kategori
      duration: '',
      price: '0',
      description: '',
      image: '',
      facilities: [],
      discountPercentage: 0,
      promoStartDate: '',
      promoEndDate: ''
    });
    setNewFacility('');
    setNewCategory('');
    setPreviewImage(null);
    setActiveTab('details');
  };

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment._id || treatment.id);
    setIsAdding(false);
    
    // Format tanggal untuk input type="date" (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString || dateString === '0000-00-00') return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Check for invalid date
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFormData({
      ...treatment,
      price: String(parseInt(treatment.price) || 0),
      category: Array.isArray(treatment.category) ? treatment.category : (treatment.category ? [treatment.category] : []),
      facilities: treatment.facilities || [],
      discountPercentage: treatment.discount_percentage || 0,
      promoStartDate: formatDateForInput(treatment.promo_start_date),
      promoEndDate: formatDateForInput(treatment.promo_end_date)
    });
    setNewFacility('');
    setNewCategory('');
    setPreviewImage(treatment.image);
    setActiveTab('details');
  };

  // Handle Tambah Kategori Baru
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama kategori wajib diisi'
      });
      return;
    }

    // Cek apakah kategori sudah ada di availableCategories
    if (availableCategories.includes(newCategory.trim())) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Kategori Sudah Ada',
        message: 'Kategori ini sudah ada di daftar'
      });
      return;
    }

    const newCategoryValue = newCategory.trim();
    
    try {
      const Token = localStorage.getItem('token');
      await axios.post(`${OPTIONS_API_URL}/categories`, 
        { value: newCategoryValue },
        { headers: { Authorization: `Bearer ${Token}` } }
      );

      // Refresh categories dari database
      await fetchCategories();

      // Tambahkan ke kategori yang dipilih
      const currentCategories = formData.category || [];
      setFormData({
        ...formData,
        category: [...currentCategories, newCategoryValue]
      });

      setNewCategory('');
      setNotification({
        show: true,
        type: 'success',
        title: 'Kategori Ditambahkan',
        message: `Kategori "${newCategoryValue}" berhasil ditambahkan ke database`
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menambahkan Kategori',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan kategori'
      });
    }
  };

  // Handle Hapus Kategori Custom
  const handleRemoveCategory = async (category) => {
    try {
      const Token = localStorage.getItem('token');
      await axios.delete(`${OPTIONS_API_URL}/categories`, {
        data: { value: category },
        headers: { Authorization: `Bearer ${Token}` }
      });

      // Refresh categories dari database
      await fetchCategories();
      
      // Hapus dari kategori yang dipilih jika ada
      const currentCategories = formData.category || [];
      if (currentCategories.includes(category)) {
        setFormData({
          ...formData,
          category: currentCategories.filter(cat => cat !== category)
        });
      }
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Kategori Dihapus',
        message: `Kategori "${category}" berhasil dihapus dari database`
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menghapus Kategori',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus kategori'
      });
    }
  };

  // Handle Tambah Fasilitas Baru ke Daftar
  const handleAddFacility = async () => {
    if (!newFacility.trim()) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama fasilitas wajib diisi'
      });
      return;
    }

    const newFacilityValue = newFacility.trim();
    
    // Cek apakah fasilitas sudah ada di availableFacilities
    if (availableFacilities.includes(newFacilityValue)) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Fasilitas Sudah Ada',
        message: 'Fasilitas ini sudah ada di daftar'
      });
      return;
    }

    try {
      const Token = localStorage.getItem('token');
      await axios.post(`${OPTIONS_API_URL}/facilities`, 
        { value: newFacilityValue },
        { headers: { Authorization: `Bearer ${Token}` } }
      );

      // Refresh facilities dari database
      await fetchFacilities();

      // Tambahkan ke fasilitas yang dipilih
      const currentFacilities = formData.facilities || [];
      setFormData({
        ...formData,
        facilities: [...currentFacilities, newFacilityValue]
      });

      setNewFacility('');
      setNotification({
        show: true,
        type: 'success',
        title: 'Fasilitas Ditambahkan',
        message: `Fasilitas "${newFacilityValue}" berhasil ditambahkan ke database`
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menambahkan Fasilitas',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan fasilitas'
      });
    }
  };

  // Handle Hapus Fasilitas dari Daftar
  const handleRemoveFacilityFromList = async (facility) => {
    try {
      const Token = localStorage.getItem('token');
      await axios.delete(`${OPTIONS_API_URL}/facilities`, {
        data: { value: facility },
        headers: { Authorization: `Bearer ${Token}` }
      });

      // Refresh facilities dari database
      await fetchFacilities();
      
      // Hapus dari fasilitas yang dipilih jika ada
      const currentFacilities = formData.facilities || [];
      if (currentFacilities.includes(facility)) {
        setFormData({
          ...formData,
          facilities: currentFacilities.filter(f => f !== facility)
        });
      }
      
      setNotification({
        show: true,
        type: 'success',
        title: 'Fasilitas Dihapus',
        message: `Fasilitas "${facility}" berhasil dihapus dari database`
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menghapus Fasilitas',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus fasilitas'
      });
    }
  };

  // Handle Toggle Fasilitas
  const handleFacilityToggle = (facility) => {
    const currentFacilities = formData.facilities || [];
    if (currentFacilities.includes(facility)) {
      // Remove facility
      setFormData({
        ...formData,
        facilities: currentFacilities.filter(f => f !== facility)
      });
    } else {
      // Add facility
      setFormData({
        ...formData,
        facilities: [...currentFacilities, facility]
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || formData.category.length === 0 || !formData.duration) {
        setNotification({
          show: true,
          type: 'error',
          title: 'Validasi Gagal',
          message: 'Harap isi semua bidang yang wajib diisi (termasuk minimal 1 kategori)'
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
        facilities: formData.facilities.filter(facility => facility.trim() !== ''),
        discountPercentage: parseInt(formData.discountPercentage) || 0,
        promoStartDate: formData.promoStartDate && formData.promoStartDate.trim() !== '' ? formData.promoStartDate : null,
        promoEndDate: formData.promoEndDate && formData.promoEndDate.trim() !== '' ? formData.promoEndDate : null
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
      category: [], // Array untuk multiple kategori
      duration: '',
      price: '0',
      description: '',
      image: '',
      facilities: [],
      discountPercentage: 0,
      promoStartDate: '',
      promoEndDate: ''
    });
    setNewFacility('');
    setNewCategory('');
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

  // Handle Category Toggle
  const handleCategoryToggle = (category) => {
    const currentCategories = formData.category || [];
    if (currentCategories.includes(category)) {
      // Remove category
      setFormData({
        ...formData,
        category: currentCategories.filter(cat => cat !== category)
      });
    } else {
      // Add category
      setFormData({
        ...formData,
        category: [...currentCategories, category]
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Ukuran File Terlalu Besar',
        message: 'File yang Anda pilih melebihi batas maksimal 2MB. Silakan pilih file yang lebih kecil.'
      });
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setNotification({
        show: true,
        type: 'error',
        title: 'File Bukan Gambar',
        message: 'File yang Anda pilih bukan gambar. Silakan pilih file gambar (JPG, PNG, GIF).'
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData({ ...formData, image: reader.result });
      setNotification({
        show: true,
        type: 'success',
        title: 'Gambar Berhasil Ditambahkan',
        message: 'Gambar berhasil diupload dan siap disimpan.'
      });
    };
    reader.onerror = () => {
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Membaca File',
        message: 'Terjadi kesalahan saat membaca file. Silakan coba lagi.'
      });
    };
    reader.readAsDataURL(file);
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
    return <Preloader type="partial" text="Memuat perawatan..." />;
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Perawatan</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola perawatan dan layanan yang tersedia.</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm sm:text-base rounded-lg hover:bg-gray-700 flex items-center justify-center"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Perawatan
        </button>
      </div>

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

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Cari perawatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <label className="text-sm font-medium text-gray-700">Filter Kategori:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Semua Kategori</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="px-3 py-1.5 sm:py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Results Summary */}
          {(searchTerm || selectedCategory) && (
            <p className="text-sm text-gray-600">
              Menampilkan {Array.isArray(treatments) && treatments.filter(treatment => {
                const categories = Array.isArray(treatment.category) ? treatment.category : [treatment.category];
                const matchesSearch = (treatment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  categories.some(cat => (cat || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (treatment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (treatment.duration || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = !selectedCategory || categories.includes(selectedCategory);
                return matchesSearch && matchesCategory;
              }).length} dari {treatments.length} perawatan
            </p>
          )}
        </div>
      </div>

      {/* Treatments Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.isArray(treatments) && treatments
          .filter(treatment => {
            const categories = Array.isArray(treatment.category) ? treatment.category : [treatment.category];
            const matchesSearch = (treatment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              categories.some(cat => (cat || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
              (treatment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (treatment.duration || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || categories.includes(selectedCategory);
            return matchesSearch && matchesCategory;
          })
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
              <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[50%]">
                {(Array.isArray(treatment.category) ? treatment.category : [treatment.category]).filter(Boolean).map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-brown-100 text-brown-800 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
              {isPromoActive(treatment) && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  PROMO {treatment.discount_percentage}%
                </div>
              )}
            </div>

            {/* Treatment Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{treatment.name}</h3>
                <div className="text-right">
                  {isPromoActive(treatment) ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">{formatRupiah(treatment.price)}</div>
                      <div className="text-lg font-bold text-red-600">{formatRupiah(calculateDiscountedPrice(treatment.price, treatment.discount_percentage))}</div>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-brown-600">
                      {formatRupiah(treatment.price)}
                    </span>
                  )}
                </div>
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
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              {isAdding ? 'Tambah Perawatan Baru' : 'Edit Perawatan'}
            </h3>

            {/* Tabs */}
            <div className="mb-4 sm:mb-6 border-b border-gray-200">
              <nav className="flex space-x-4 sm:space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${activeTab === 'details'
                    ? 'border-brown-500 text-brown-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Detail Perawatan
                </button>
                <button
                  onClick={() => setActiveTab('facilities')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm ${activeTab === 'facilities'
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
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Gambar Perawatan</label>

                  {/* Image Preview */}
                  <div className="mb-3 sm:mb-4 flex justify-center">
                    <div className="w-48 h-36 sm:w-64 sm:h-48 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
                          <svg className="w-8 h-8 sm:w-12 sm:h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs sm:text-sm">Unggah gambar perawatan</span>
                          <span className="text-[10px] sm:text-xs mt-1">Rekomendasi: 800x600 px</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Options */}
                  <div className="space-y-2 sm:space-y-3">
                    {/* Upload from Computer */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Unggah Gambar</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-xs sm:text-sm text-gray-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100"
                      />
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">JPG, PNG, GIF maksimal 2MB</p>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs sm:text-sm">
                        <span className="px-2 bg-white text-gray-500">ATAU</span>
                      </div>
                    </div>

                    {/* Image URL Input */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                      <input
                        type="text"
                        value={previewImage || ''}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/gambar-perawatan.jpg"
                        className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Treatment Details Form */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Nama Perawatan</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base"
                      placeholder="Masukkan nama perawatan"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Kategori (Pilih minimal 1)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableCategories.map((cat) => (
                          <label
                            key={cat}
                            className={`group flex items-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all relative ${
                              (formData.category || []).includes(cat)
                                ? 'border-brown-500 bg-brown-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={(formData.category || []).includes(cat)}
                              onChange={() => handleCategoryToggle(cat)}
                              className="w-4 h-4 text-brown-600 border-gray-300 rounded focus:ring-brown-500"
                            />
                            <span className={`text-xs sm:text-sm font-medium flex-1 ${
                              (formData.category || []).includes(cat) ? 'text-brown-700' : 'text-gray-700'
                            }`}>
                              {cat}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm(`Hapus kategori "${cat}" dari daftar?`)) {
                                  handleRemoveCategory(cat);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus kategori dari daftar"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </label>
                        ))}
                      </div>

                      {/* Tambah Kategori Baru */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Atau Tambah Kategori Baru
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                            className="flex-1 border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                            placeholder="Masukkan nama kategori baru..."
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 text-xs sm:text-sm font-medium whitespace-nowrap"
                          >
                            + Tambah
                          </button>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          Kategori baru akan muncul sebagai pilihan checkbox di atas dan otomatis dipilih
                        </p>
                      </div>

                      {/* Kategori Terpilih */}
                      {(formData.category || []).length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm font-medium text-blue-800 mb-2">
                            {(formData.category || []).length} kategori terpilih:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(formData.category || []).map((cat, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {cat}
                                <button
                                  type="button"
                                  onClick={() => handleCategoryToggle(cat)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">Durasi</label>
                      <select
                        name="duration"
                        value={formData.duration || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base"
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Harga</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                        <span className="text-xs sm:text-sm text-gray-500">Rp</span>
                      </div>
                      <input
                        type="text"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm sm:text-base"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      Harga akhir akan ditampilkan sebagai: {formatRupiah(formData.price)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base"
                      placeholder="Jelaskan detail perawatan, manfaat, dll."
                    />
                  </div>
                </div>

                {/* Promo Section */}
                <div className="border-t pt-3 sm:pt-4 mt-4">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">Pengaturan Promo</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Diskon (%)
                      </label>
                      <input 
                        type="number" 
                        name="discountPercentage"
                        min="0"
                        max="100"
                        value={formData.discountPercentage || 0} 
                        onChange={handleChange} 
                        placeholder="0" 
                        className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                      />
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Masukkan persentase diskon (0-100). Contoh: 20 untuk diskon 20%
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Tanggal Mulai Promo
                        </label>
                        <input 
                          type="date" 
                          name="promoStartDate"
                          value={formData.promoStartDate || ''} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Tanggal Berakhir Promo
                        </label>
                        <input 
                          type="date" 
                          name="promoEndDate"
                          value={formData.promoEndDate || ''} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                        />
                      </div>
                    </div>

                    {formData.discountPercentage > 0 && formData.price && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">Preview Harga Promo:</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-500 line-through">{formatRupiah(formData.price)}</span>
                          <span className="text-base sm:text-lg font-bold text-green-600">
                            {formatRupiah(calculateDiscountedPrice(parseInt(formData.price), formData.discountPercentage))}
                          </span>
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">
                            Hemat {formData.discountPercentage}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Facilities Tab */
              <div className="space-y-3 sm:space-y-4">
                {/* Pilih Fasilitas dari Daftar */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                    Pilih Fasilitas yang Termasuk
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableFacilities.map((facility) => (
                      <label
                        key={facility}
                        className={`group flex items-center gap-2 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all relative ${
                          (formData.facilities || []).includes(facility)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={(formData.facilities || []).includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className={`text-xs sm:text-sm font-medium flex-1 ${
                          (formData.facilities || []).includes(facility) ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {facility}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm(`Hapus fasilitas "${facility}" dari daftar?`)) {
                              handleRemoveFacilityFromList(facility);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Hapus fasilitas dari daftar"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </label>
                    ))}
                  </div>

                  {/* Fasilitas Terpilih */}
                  {(formData.facilities || []).length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs sm:text-sm font-medium text-green-800 mb-2">
                        {(formData.facilities || []).length} fasilitas terpilih:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(formData.facilities || []).map((facility, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {facility}
                            <button
                              type="button"
                              onClick={() => handleFacilityToggle(facility)}
                              className="text-green-500 hover:text-green-700"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tambah Fasilitas Baru */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Atau Tambah Fasilitas Baru</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newFacility}
                      onChange={(e) => setNewFacility(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base"
                      placeholder="cth: Hot Stone Therapy, LED Light Therapy"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())}
                    />
                    <button
                      onClick={handleAddFacility}
                      className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium whitespace-nowrap"
                    >
                      + Tambah
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                    Fasilitas baru akan muncul sebagai pilihan checkbox di atas dan otomatis dipilih
                  </p>
                </div>

                {/* Info */}
                {formData.facilities.length === 0 && (
                  <div className="text-center py-6 sm:py-8 bg-blue-50 rounded-lg border border-blue-200">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-blue-400 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm sm:text-base text-blue-700 font-medium">Belum ada fasilitas dipilih</p>
                    <p className="text-xs sm:text-sm text-blue-600 mt-1">Pilih fasilitas dari checkbox di atas atau tambahkan fasilitas baru</p>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 sm:mt-6">
              <div className="text-xs sm:text-sm text-gray-500">
                {activeTab === 'facilities' && (
                  <span>{formData.facilities.length} fasilitas termasuk</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 order-2 sm:order-1"
                >
                  Batal
                </button>
                {activeTab === 'details' ? (
                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 order-1 sm:order-2"
                  >
                    Selanjutnya: Tambah Fasilitas
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('details')}
                      className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 order-1 sm:order-2"
                    >
                      Kembali ke Detail
                    </button>
                    <button
                      onClick={handleSave}
                      className={`w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-colors order-1 sm:order-3 ${
                        isAdding
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
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
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
