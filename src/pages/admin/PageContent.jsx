import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Error image SVG constant
const ERROR_IMAGE_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23888" font-size="12"%3EError%3C/text%3E%3C/svg%3E';

const PageContent = () => {
  // State Management
  const [pageInfos, setPageInfos] = useState([]);
  const [editingInfo, setEditingInfo] = useState(null);
  const [formData, setFormData] = useState({
    page_type: '',
    section_key: '',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    additional_data: {},
    is_active: true,
    display_order: 1
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '', duration: 3000 });
  const [selectedPageType, setSelectedPageType] = useState('home');
  const [previewImage, setPreviewImage] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [additionalFields, setAdditionalFields] = useState({
    benefits: [''],
    discount_percentage: '',
    whatsapp_number: '',
    promo_label: '',
    visi: '',
    misi: [''],
    phone_display: '',
    whatsapp_url: '',
    map_embed_url: '',
    maps_url: '',
    awards: [{ id: Date.now(), title: '', image: '' }],
    facilities: [{ id: Date.now(), name: '', description: '', image: '' }]
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch page infos on component mount
  useEffect(() => {
    fetchPageInfos();
  }, []);

  // Fetch all page infos from API
  const fetchPageInfos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/page-info?include_inactive=true`, getAuthHeaders());
      setPageInfos(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching page infos:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
      showNotification('Gagal Memuat', 'Gagal memuat data', 'error', 5000);
      setPageInfos([]);
    } finally {
      setLoading(false);
    }
  };

  // Show notification toast
  const showNotification = (title, message, type, duration = 3000) => {
    setNotification({ show: true, type, title, message, duration });
  };

  // Close notification manually
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Auto-hide notification with single timer
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.duration]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Auto-set section_key to 'main_promo' when page_type changes to promo
    if (name === 'page_type' && newValue === 'promo') {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        section_key: 'main_promo'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  // Handle additional field changes
  const handleAdditionalFieldChange = (field, value, index = null) => {
    if (index !== null) {
      setAdditionalFields(prev => {
        const newArray = [...prev[field]];
        newArray[index] = value;
        return { ...prev, [field]: newArray };
      });
    } else {
      setAdditionalFields(prev => ({ ...prev, [field]: value }));
    }
  };

  // Add benefit field
  const addBenefit = () => {
    setAdditionalFields(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  // Remove benefit field
  const removeBenefit = (index) => {
    setAdditionalFields(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  // Add misi field
  const addMisi = () => {
    setAdditionalFields(prev => ({
      ...prev,
      misi: [...prev.misi, '']
    }));
  };

  // Remove misi field
  const removeMisi = (index) => {
    setAdditionalFields(prev => ({
      ...prev,
      misi: prev.misi.filter((_, i) => i !== index)
    }));
  };

  // Add award field
  const addAward = () => {
    setAdditionalFields(prev => ({
      ...prev,
      awards: [...prev.awards, { id: Date.now(), title: '', image: '' }]
    }));
  };

  // Remove award field
  const removeAward = (index) => {
    setAdditionalFields(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index)
    }));
  };

  // Handle award field change
  const handleAwardChange = (index, field, value) => {
    setAdditionalFields(prev => {
      const newAwards = [...prev.awards];
      newAwards[index] = { ...newAwards[index], [field]: value };
      return { ...prev, awards: newAwards };
    });
  };

  // Add facility field
  const addFacility = () => {
    setAdditionalFields(prev => ({
      ...prev,
      facilities: [...prev.facilities, { id: Date.now(), name: '', description: '', image: '' }]
    }));
  };

  // Remove facility field
  const removeFacility = (index) => {
    setAdditionalFields(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  // Handle facility field change
  const handleFacilityChange = (index, field, value) => {
    setAdditionalFields(prev => {
      const newFacilities = [...prev.facilities];
      newFacilities[index] = { ...newFacilities[index], [field]: value };
      return { ...prev, facilities: newFacilities };
    });
  };

  // Handle award image upload
  const handleAwardImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification(
        'File Terlalu Besar', 
        'Ukuran gambar maksimal 2MB untuk upload langsung.', 
        'error'
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Format File Salah', 'Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const sizeInKB = Math.round((base64String.length * 3) / 4 / 1024);
      
      handleAwardChange(index, 'image', base64String);
      showNotification(
        'Berhasil!', 
        `Gambar penghargaan berhasil diupload (~${sizeInKB}KB). Klik Simpan untuk menyimpan.`, 
        'success'
      );
    };
    reader.onerror = () => {
      showNotification('Gagal Membaca File', 'Terjadi kesalahan saat membaca file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle facility image upload
  const handleFacilityImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification(
        'File Terlalu Besar', 
        'Ukuran gambar maksimal 2MB untuk upload langsung.', 
        'error'
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Format File Salah', 'Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const sizeInKB = Math.round((base64String.length * 3) / 4 / 1024);
      
      handleFacilityChange(index, 'image', base64String);
      showNotification(
        'Berhasil!', 
        `Gambar fasilitas berhasil diupload (~${sizeInKB}KB). Klik Simpan untuk menyimpan.`, 
        'success'
      );
    };
    reader.onerror = () => {
      showNotification('Gagal Membaca File', 'Terjadi kesalahan saat membaca file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Prepare additional data based on page type
  const prepareAdditionalData = () => {
    if (formData.page_type === 'promo') {
      return {
        benefits: additionalFields.benefits.filter(b => b.trim() !== ''),
        discount_percentage: additionalFields.discount_percentage,
        whatsapp_number: additionalFields.whatsapp_number,
        promo_label: additionalFields.promo_label
      };
    } else if (formData.page_type === 'about' && formData.section_key === 'vision') {
      return {
        visi: additionalFields.visi,
        misi: additionalFields.misi.filter(m => m.trim() !== '')
      };
    } else if (formData.page_type === 'about' && formData.section_key === 'awards') {
      return {
        items: additionalFields.awards.filter(a => a.title.trim() !== '' || a.image.trim() !== '')
      };
    } else if (formData.page_type === 'about' && formData.section_key === 'facilities') {
      return {
        items: additionalFields.facilities.filter(f => f.name.trim() !== '')
      };
    } else if (formData.page_type === 'home' && formData.section_key === 'footer_contact') {
      return {
        phone_display: additionalFields.phone_display,
        whatsapp_url: additionalFields.whatsapp_url,
        map_embed_url: additionalFields.map_embed_url,
        maps_url: additionalFields.maps_url
      };
    }
    return {};
  };

  // Validate section_key based on page_type
  const isSectionKeyRequired = () => {
    return formData.page_type === 'home' || formData.page_type === 'about' || formData.page_type === 'promo';
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate section_key if required or for promo (always required)
    if ((isSectionKeyRequired() || formData.page_type === 'promo') && !formData.section_key.trim()) {
      showNotification('Validasi Error', 'Section Key wajib diisi', 'error');
      return;
    }
    
    // Ensure promo always has section_key as 'main_promo'
    if (formData.page_type === 'promo' && formData.section_key !== 'main_promo') {
      showNotification('Validasi Error', 'Section Key untuk promo harus "main_promo"', 'error');
      return;
    }
    
    const submitData = {
      ...formData,
      additional_data: prepareAdditionalData()
    };

    try {
      setApiLoading(true);
      if (editingInfo) {
        await axios.put(`${API_URL}/page-info/${editingInfo.id}`, submitData, getAuthHeaders());
        showNotification('Berhasil!', 'Data berhasil diperbarui!', 'success', 3000);
      } else {
        await axios.post(`${API_URL}/page-info`, submitData, getAuthHeaders());
        showNotification('Berhasil!', 'Data berhasil ditambahkan!', 'success', 3000);
      }
      
      fetchPageInfos();
      closeForm();
    } catch (err) {
      showNotification('Gagal Menyimpan', err.response?.data?.error || 'Terjadi kesalahan', 'error', 5000);
    } finally {
      setApiLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      setApiLoading(true);
      await axios.delete(`${API_URL}/page-info/${id}`, getAuthHeaders());
      showNotification('Berhasil!', 'Data berhasil dihapus!', 'success', 3000);
      fetchPageInfos();
    } catch (err) {
      showNotification('Gagal Menghapus', 'Gagal menghapus data', 'error', 5000);
    } finally {
      setApiLoading(false);
    }
  };

  // Handle restore
  const handleRestore = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin mengaktifkan kembali data ini?')) return;

    try {
      setApiLoading(true);
      const response = await axios.patch(`${API_URL}/page-info/${id}/restore`, {}, getAuthHeaders());
      showNotification('Berhasil!', 'Data berhasil dipulihkan!', 'success', 3000);
      fetchPageInfos();
    } catch (err) {
      console.error('Error restoring page info:', err);
      showNotification('Gagal Memulihkan', err.response?.data?.error || 'Gagal memulihkan data', 'error', 5000);
    } finally {
      setApiLoading(false);
    }
  };

  // Open form for adding new info
  const openAddForm = () => {
    setIsAdding(true);
    setEditingInfo(null);
    setFormData({
      page_type: '',
      section_key: '', 
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      additional_data: {},
      is_active: true,
      display_order: 1
    });
    setAdditionalFields({
      benefits: [''],
      discount_percentage: '',
      whatsapp_number: '',
      promo_label: '',
      visi: '',
      misi: [''],
      phone_display: '',
      whatsapp_url: '',
      map_embed_url: '',
      maps_url: '',
      awards: [{ id: Date.now(), title: '', image: '' }],
      facilities: [{ id: Date.now(), name: '', description: '', image: '' }]
    });
    setPreviewImage('');
  };

  // Open form for editing existing info
  const openEditForm = (info) => {
    setIsAdding(true);
    setEditingInfo(info);
    
    const imageUrl = info.image_url || '';
    
    setFormData({
      page_type: info.page_type,
      section_key: info.section_key || '',
      title: info.title || '',
      subtitle: info.subtitle || '',
      content: info.content || '',
      image_url: imageUrl,
      additional_data: info.additional_data || {},
      is_active: info.is_active,
      display_order: info.display_order || 1
    });
    
    // Set preview image
    setPreviewImage(imageUrl);

    // Load additional fields
    const additionalData = info.additional_data || {};
    
    // Helper to ensure items have id for React keys
    const ensureItemsHaveIds = (items) => {
      return (items || []).map(item => ({
        ...item,
        id: item.id || Date.now() + Math.random()
      }));
    };
    
    setAdditionalFields({
      benefits: (additionalData.benefits || []).filter(b => b.trim() !== '').length > 0 
        ? (additionalData.benefits || []).filter(b => b.trim() !== '')
        : [''],
      discount_percentage: additionalData.discount_percentage || '',
      whatsapp_number: additionalData.whatsapp_number || '',
      promo_label: additionalData.promo_label || '',
      visi: additionalData.visi || '',
      misi: (additionalData.misi || []).filter(m => m.trim() !== '').length > 0
        ? (additionalData.misi || []).filter(m => m.trim() !== '')
        : [''],
      phone_display: additionalData.phone_display || '',
      whatsapp_url: additionalData.whatsapp_url || '',
      map_embed_url: additionalData.map_embed_url || '',
      maps_url: additionalData.maps_url || '',
      awards: additionalData.items && info.section_key === 'awards' ? ensureItemsHaveIds(additionalData.items) : [{ id: Date.now(), title: '', image: '' }],
      facilities: additionalData.items && info.section_key === 'facilities' ? ensureItemsHaveIds(additionalData.items) : [{ id: Date.now(), name: '', description: '', image: '' }]
    });
  };

  // Close form
  const closeForm = () => {
    setIsAdding(false);
    setEditingInfo(null);
  };

  // Filter page infos by type
  const filteredInfos = Array.isArray(pageInfos) 
    ? pageInfos.filter(info => info.page_type === selectedPageType)
    : [];

  // Page type options
  const pageTypes = [
    { value: 'home', label: 'Home' },
    { value: 'about', label: 'About' },
    { value: 'promo', label: 'Promo' }
  ];

  // Count items per type
  const getCountByType = (type) => {
    return pageInfos.filter(info => info.page_type === type).length;
  };

  // Handle image upload from device
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification(
        'File Terlalu Besar', 
        'Ukuran gambar maksimal 2MB untuk upload langsung.', 
        'error'
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Format File Salah', 'Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const sizeInKB = Math.round((base64String.length * 3) / 4 / 1024);
      
      setPreviewImage(base64String);
      setFormData(prev => ({ ...prev, image_url: base64String }));
      showNotification(
        'Berhasil!', 
        `Gambar berhasil diupload (~${sizeInKB}KB). Klik Simpan untuk menyimpan.`, 
        'success'
      );
    };
    reader.onerror = () => {
      showNotification('Gagal Membaca File', 'Terjadi kesalahan saat membaca file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image_url: url }));
    // Only update preview if URL is not empty
    if (url.trim()) {
      setPreviewImage(url);
    }
  };

  // Remove image
  const removeImage = () => {
    setPreviewImage('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-6 lg:p-8">
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9CA3AF;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>

      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#D7CCC8]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#3E2723] border-r-[#8D6E63] animate-spin"></div>
            </div>
            <p className="text-[#3E2723] font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-start gap-3 px-6 py-4 rounded-lg shadow-2xl min-w-[300px] ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">{notification.title}</div>
              <div className="text-sm opacity-90">{notification.message}</div>
            </div>
            <button
              onClick={closeNotification}
              className="flex-shrink-0 hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Kelola Konten Website
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mb-4">
          Kelola informasi konten untuk halaman Home, About, dan Promo. Informasi kontak seperti nomor telepon, email, dan alamat dapat dikelola di menu Kontak.
        </p>
        
        {/* Info Banner for Home Page Sections */}
        {selectedPageType === 'home' && (
          <div className="bg-gradient-to-r from-brown-50 border-l-4 border-brown-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-brown-500 p-2 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-brown-900 mb-2">
                    Panduan Konten Halaman Home
                </h3>
                <p className="text-xs text-brown-800 mb-2">
                  Untuk konten yang muncul di halaman Home, pastikan menggunakan <strong>Page Type: Home</strong> dengan section_key berikut:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">hero</code> - Banner utama
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">about</code> - Bagian About di Home
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">promo_banner</code> - Banner promo
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">footer_contact</code> - Kontak di footer
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Info Banner for About Page Sections */}
        {selectedPageType === 'about' && (
          <div className="bg-gradient-to-r from-brown-50 border-l-4 border-brown-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-brown-500 p-2 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-brown-900 mb-2">
                    Panduan Konten Halaman About
                </h3>
                <p className="text-xs text-brown-800 mb-2">
                  Untuk konten yang muncul di halaman About, pastikan menggunakan <strong>Page Type: About</strong> dengan section_key berikut:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">story</code> - Cerita/Banner utama
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">vision</code> - Visi & Misi
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">awards</code> - Penghargaan (slider)
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <code className="text-brown-600 font-bold">facilities</code> - Fasilitas (grid)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {pageTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedPageType(type.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
                  selectedPageType === type.value
                    ? 'bg-brown-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  ({getCountByType(type.value)})
                </span>
              </button>
            ))}
          </div>
          
          {/* View Toggle & Add Button */}
          <div className="flex gap-2 items-center">
            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#8B6F47] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tampilan Grid"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-xs font-medium hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#8B6F47] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tampilan List"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-xs font-medium hidden sm:inline">List</span>
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={openAddForm}
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Tambah Konten</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      {filteredInfos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Belum Ada Konten
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Mulai tambahkan konten untuk website Anda
          </p>
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Konten Pertama
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredInfos.map((info, index) => (
            <div
              key={info.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!info.is_active ? 'opacity-60 border-2 border-gray-400' : ''}`}
            >
              {/* Image */}
              {info.image_url && (
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={info.image_url}
                    alt={info.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {info.is_active ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Aktif
                      </span>
                    ) : (
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Nonaktif
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium uppercase">
                    {info.page_type}
                  </span>
                  {info.section_key && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {info.section_key}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {info.title || 'Tanpa Judul'}
                </h3>

                {/* Subtitle */}
                {info.subtitle && (
                  <p className="text-gray-700 text-sm mb-2 font-medium line-clamp-1">
                    {info.subtitle}
                  </p>
                )}

                {/* Content Preview */}
                {info.content && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {info.content}
                  </p>
                )}

                {/* Additional Info */}
                {info.additional_data && Object.keys(info.additional_data).length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">
                      Data Tambahan: {Object.keys(info.additional_data).length} field
                    </p>
                  </div>
                )}

                {/* Display Order */}
                <div className="mb-3 text-xs text-gray-500">
                  Urutan Tampilan: {info.display_order}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {info.is_active ? (
                    <>
                      <button
                        onClick={() => openEditForm(info)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(info.id)}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 text-sm transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(info.id)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors"
                    >
                      Pulihkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3 sm:space-y-4">
          {filteredInfos.map((info) => (
            <div 
              key={info.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!info.is_active ? 'opacity-60 border-2 border-gray-400' : ''}`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {info.image_url && (
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                    <img 
                      src={info.image_url} 
                      alt={info.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {info.is_active ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 p-4 sm:p-6">
                  {/* Type Badge & Order */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium uppercase">
                      {info.page_type}
                    </span>
                    {info.section_key && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {info.section_key}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      Urutan: {info.display_order}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {info.title || 'Tanpa Judul'}
                  </h3>

                  {/* Subtitle */}
                  {info.subtitle && (
                    <p className="text-gray-700 text-sm sm:text-base mb-2 font-medium">
                      {info.subtitle}
                    </p>
                  )}

                  {/* Content Preview */}
                  {info.content && (
                    <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
                      {info.content}
                    </p>
                  )}

                  {/* Additional Info */}
                  {info.additional_data && Object.keys(info.additional_data).length > 0 && (
                    <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200 inline-block">
                      <p className="text-xs text-gray-600 font-medium">
                        Data Tambahan: {Object.keys(info.additional_data).length} field
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {info.is_active ? (
                      <>
                        <button
                          onClick={() => openEditForm(info)}
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(info.id)}
                          className="px-3 sm:px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestore(info.id)}
                        className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs sm:text-sm font-medium transition-colors"
                      >
                        Pulihkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isAdding && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50"
          onClick={closeForm}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex items-center justify-between z-10">
              <div className="flex-1">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                  {editingInfo ? 'Edit Konten' : 'Tambah Konten Baru'}
                </h2>
                {/* Show helper text when editing about section */}
                {editingInfo && formData.page_type === 'home' && formData.section_key === 'about' && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    ðŸ“ Anda sedang mengedit section <strong>About</strong> yang muncul di halaman Home
                  </p>
                )}
              </div>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto custom-scrollbar flex-1 px-4 sm:px-6 py-3 sm:py-4">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Page Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tipe Halaman *
                  </label>
                  <select
                    name="page_type"
                    value={formData.page_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Tipe Halaman</option>
                    <option value="home">Home</option>
                    <option value="about">About</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>

                {/* Section Key */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Section Key {(formData.page_type === 'home' || formData.page_type === 'about' || formData.page_type === 'promo') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    name="section_key"
                    value={formData.section_key}
                    onChange={handleInputChange}
                    readOnly={formData.page_type === 'promo'}
                    required={isSectionKeyRequired() || formData.page_type === 'promo'}
                    placeholder={
                      formData.page_type === 'home' 
                        ? "Contoh: hero, about, services, promo_banner, footer_contact"
                        : formData.page_type === 'about'
                        ? "Contoh: story, vision, awards, facilities"
                        : formData.page_type === 'promo'
                        ? "main_promo"
                        : ""
                    }
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.page_type === 'promo' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.page_type === 'home' ? (
                      <span className="text-brown-600 font-medium">
                        <strong>Untuk Halaman Home</strong>, gunakan section_key: <code className="bg-brown-50 px-1.5 py-0.5 rounded">hero</code>, <code className="bg-brown-50 px-1.5 py-0.5 rounded">about</code>, <code className="bg-brown-50 px-1.5 py-0.5 rounded">services</code>, <code className="bg-brown-50 px-1.5 py-0.5 rounded">promo_banner</code>, atau <code className="bg-brown-50 px-1.5 py-0.5 rounded">footer_contact</code>
                      </span>
                    ) : formData.page_type === 'about' ? (
                      <span className="text-brown-600 font-medium">
                        <strong>Untuk Halaman About</strong>, gunakan section_key: <code className="bg-green-50 px-1.5 py-0.5 rounded">story</code>, <code className="bg-green-50 px-1.5 py-0.5 rounded">vision</code>, <code className="bg-green-50 px-1.5 py-0.5 rounded">awards</code>, atau <code className="bg-green-50 px-1.5 py-0.5 rounded">facilities</code>
                      </span>
                    ) : formData.page_type === 'promo' ? (
                      <span className="text-blue-600 font-medium">
                        <strong>Untuk Promo</strong>, section_key otomatis diset ke <code className="bg-blue-50 px-1.5 py-0.5 rounded">main_promo</code>
                      </span>
                    ) : (
                      'Identifier unik untuk section'
                    )}
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Judul
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul konten"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Masukkan subtitle"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Konten
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Masukkan konten detail"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload/URL */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-brown-200">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                    <svg className="w-5 h-5 text-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Gambar Konten
                  </label>
                  
                  {/* Method 1: Image Upload Button */}
                  <div className="mb-3 bg-white p-3 rounded-lg border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Upload (Maks 2MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      key="main-image-upload"
                    />
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-blue-800">
                        ðŸ’¡ <strong>Tips:</strong> Untuk performa terbaik, compress gambar sebelum upload atau gunakan URL dari hosting/CDN.
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-xs font-bold text-gray-500 my-2">â”€â”€ ATAU â”€â”€</div>

                  {/* Method 2: Image URL Input - RECOMMENDED */}
                  <div className="bg-white p-3 rounded-lg border-2 border-green-300 shadow-sm">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1.5">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">REKOMENDASI</span>
                      ðŸ”— Masukkan URL Gambar
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-800">
                        âœ… <strong>Keuntungan URL:</strong> Loading lebih cepat, tidak ada batasan ukuran, mudah diganti.
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {previewImage && (
                    <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">ðŸ‘ï¸ Preview Gambar:</p>
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-40 w-auto rounded-lg shadow-md border border-gray-200"
                          onError={(e) => {
                            console.error('Error loading image:', previewImage);
                            showNotification('Error', 'Gagal memuat gambar. Periksa URL atau upload ulang.', 'error', 5000);
                            e.target.src = ERROR_IMAGE_SVG;
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all transform hover:scale-110"
                          title="Hapus gambar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!previewImage && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        âš ï¸ <strong>Belum ada gambar.</strong> Upload gambar atau masukkan URL untuk menampilkan gambar.
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Fields for Promo */}
                {formData.page_type === 'promo' && (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Data Promo</h3>
                    
                    {/* Promo Label */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Label Promo
                      </label>
                      <input
                        type="text"
                        value={additionalFields.promo_label}
                        onChange={(e) => handleAdditionalFieldChange('promo_label', e.target.value)}
                        placeholder="Contoh: DISKON SPESIAL"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Discount Percentage */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Persentase Diskon (%)
                      </label>
                      <input
                        type="number"
                        value={additionalFields.discount_percentage}
                        onChange={(e) => handleAdditionalFieldChange('discount_percentage', e.target.value)}
                        placeholder="Contoh: 50"
                        min="0"
                        max="100"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="text"
                        value={additionalFields.whatsapp_number}
                        onChange={(e) => handleAdditionalFieldChange('whatsapp_number', e.target.value)}
                        placeholder="Contoh: 628123456789"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Manfaat Promo
                      </label>
                      {additionalFields.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleAdditionalFieldChange('benefits', e.target.value, index)}
                            placeholder={`Manfaat ${index + 1}`}
                            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {additionalFields.benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Manfaat
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Fields for About Vision */}
                {formData.page_type === 'about' && formData.section_key === 'vision' && (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Visi & Misi</h3>
                    
                    {/* Visi */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Visi
                      </label>
                      <textarea
                        value={additionalFields.visi}
                        onChange={(e) => handleAdditionalFieldChange('visi', e.target.value)}
                        rows="3"
                        placeholder="Masukkan visi perusahaan"
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Misi */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Misi
                      </label>
                      {additionalFields.misi.map((misi, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={misi}
                            onChange={(e) => handleAdditionalFieldChange('misi', e.target.value, index)}
                            placeholder={`Misi ${index + 1}`}
                            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {additionalFields.misi.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMisi(index)}
                              className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addMisi}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Misi
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Fields for About Awards */}
                {formData.page_type === 'about' && formData.section_key === 'awards' && (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">Data Penghargaan</h3>
                    </div>
                    
                    <p className="text-xs text-amber-800 bg-amber-100 p-2 rounded">
                      ðŸ’¡ Tambahkan penghargaan yang akan ditampilkan dalam slider
                    </p>

                    {additionalFields.awards.map((award, index) => (
                      <div key={award.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Penghargaan #{index + 1}
                          </label>
                          {additionalFields.awards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAward(index)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Judul</label>
                            <input
                              type="text"
                              value={award.title}
                              onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                              placeholder="Contoh: Best Beauty Clinic 2024"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Gambar Penghargaan</label>
                            <div className="space-y-2">
                              {/* Upload File */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opsi 1: Upload File (Max 2MB)</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleAwardImageUpload(index, e)}
                                  className="w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                />
                              </div>
                              {/* URL Input */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opsi 2: Gunakan URL</label>
                                <input
                                  type="url"
                                  value={award.image}
                                  onChange={(e) => handleAwardChange(index, 'image', e.target.value)}
                                  placeholder="https://example.com/award.jpg"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                              </div>
                              {/* Preview */}
                              {award.image && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                  <img
                                    src={award.image}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                      e.target.src = ERROR_IMAGE_SVG;
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addAward}
                      className="w-full px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Penghargaan
                    </button>
                  </div>
                )}

                {/* Additional Fields for About Facilities */}
                {formData.page_type === 'about' && formData.section_key === 'facilities' && (
                  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg">Data Fasilitas</h3>
                    </div>
                    
                    <p className="text-xs text-teal-800 bg-teal-100 p-2 rounded">
                      ðŸ¢ Tambahkan fasilitas yang tersedia di klinik
                    </p>

                    {additionalFields.facilities.map((facility, index) => (
                      <div key={facility.id} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Fasilitas #{index + 1}
                          </label>
                          {additionalFields.facilities.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFacility(index)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Fasilitas</label>
                            <input
                              type="text"
                              value={facility.name}
                              onChange={(e) => handleFacilityChange(index, 'name', e.target.value)}
                              placeholder="Contoh: Ruang Treatment"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                            <textarea
                              value={facility.description}
                              onChange={(e) => handleFacilityChange(index, 'description', e.target.value)}
                              placeholder="Deskripsi fasilitas..."
                              rows="2"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Gambar Fasilitas</label>
                            <div className="space-y-2">
                              {/* Upload File */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opsi 1: Upload File (Max 2MB)</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFacilityImageUpload(index, e)}
                                  className="w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                />
                              </div>
                              {/* URL Input */}
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opsi 2: Gunakan URL</label>
                                <input
                                  type="url"
                                  value={facility.image}
                                  onChange={(e) => handleFacilityChange(index, 'image', e.target.value)}
                                  placeholder="https://example.com/facility.jpg"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                />
                              </div>
                              {/* Preview */}
                              {facility.image && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                                  <img
                                    src={facility.image}
                                    alt="Preview"
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                                    onError={(e) => {
                                      e.target.src = ERROR_IMAGE_SVG;
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addFacility}
                      className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tambah Fasilitas
                    </button>
                  </div>
                )}

                {/* Additional Fields for Footer Contact */}
                {formData.page_type === 'home' && formData.section_key === 'footer_contact' && (
                  <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-brown-50 to-indigo-50 rounded-xl border-2 border-brown-600 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start gap-3 pb-3 border-b border-brown-200">
                      <div className="bg-brown-600 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg"> Pengaturan Kontak Footer</h3>
                        <p className="text-xs text-gray-600 mt-1">Atur nomor WhatsApp dan lokasi maps yang akan ditampilkan di footer website</p>
                      </div>
                    </div>

                    {/* Section 1: WhatsApp */}
                    <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-green-100 p-1.5 rounded">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Step 1: Nomor WhatsApp</h4>
                      </div>

                      {/* Phone Display */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nomor untuk Ditampilkan
                        </label>
                        <input
                          type="text"
                          value={additionalFields.phone_display}
                          onChange={(e) => handleAdditionalFieldChange('phone_display', e.target.value)}
                          placeholder="+62 819-9420-4009"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>

                      {/* WhatsApp URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          ðŸ”— Link WhatsApp
                        </label>
                        <input
                          type="text"
                          value={additionalFields.whatsapp_url}
                          onChange={(e) => handleAdditionalFieldChange('whatsapp_url', e.target.value)}
                          placeholder="https://wa.me/6281994204009"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Section 2: Google Maps */}
                    <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-red-100 p-1.5 rounded">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900">Step 2: Google Maps Lokasi</h4>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          ðŸ—ºï¸ Link Embed Google Maps
                        </label>
                        <textarea
                          value={additionalFields.map_embed_url}
                          onChange={(e) => handleAdditionalFieldChange('map_embed_url', e.target.value)}
                          rows="2"
                          placeholder="https://www.google.com/maps/embed?pb=!1m18!1m12..."
                          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-xs resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">Link untuk menampilkan peta di website</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          ðŸ“ Link Google Maps (Klik Lokasi)
                        </label>
                        <input
                          type="text"
                          value={additionalFields.maps_url}
                          onChange={(e) => handleAdditionalFieldChange('maps_url', e.target.value)}
                          placeholder="https://maps.app.goo.gl/xxxxxx"
                          className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                        />
                        <p className="mt-1 text-xs text-gray-500">Link untuk membuka Google Maps saat icon lokasi diklik</p>
                      </div>

                      {/* Info Box */}
                      <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-900 mb-1">âœ¨ Informasi Tambahan:</p>
                          <ul className="text-xs text-green-800 space-y-1 ml-3 list-disc">
                            <li>Data ini akan ditampilkan di bagian <strong>Footer</strong> website</li>
                            <li>Pastikan nomor WhatsApp aktif dan bisa menerima pesan</li>
                            <li>Maps akan menunjukkan lokasi klinik secara interaktif</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display Order */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Semakin kecil angka, semakin atas posisinya
                  </p>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                    Aktifkan konten ini
                  </label>
                </div>

                {/* Modal Footer - Sticky */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl flex gap-3 z-10 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
                  <button
                    type="submit"
                    disabled={apiLoading}
                    className={`flex-1 px-4 sm:px-6 py-2 text-white rounded-lg transition-colors ${
                      editingInfo
                        ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                        : 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400'
                    } disabled:cursor-not-allowed`}
                  >
                    {apiLoading ? 'Memproses...' : (editingInfo ? 'Perbarui' : 'Simpan')}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={apiLoading}
                    className="flex-1 px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContent;
