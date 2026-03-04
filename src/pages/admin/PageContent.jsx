import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  Check,
  Loader2,
  Home,
  Users,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedPageType, setSelectedPageType] = useState('all');
  const [previewImage, setPreviewImage] = useState('');
  const [additionalFields, setAdditionalFields] = useState({
    benefits: [''],
    discount_percentage: '',
    whatsapp_number: '',
    promo_label: '',
    visi: '',
    misi: ['']
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
      const response = await axios.get('http://localhost:5000/api/page-info', getAuthHeaders());
      setPageInfos(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching page infos:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
      showNotification('Gagal memuat data', 'error');
      setPageInfos([]);
    } finally {
      setLoading(false);
    }
  };

  // Show notification toast
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    }
    return {};
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      additional_data: prepareAdditionalData()
    };

    try {
      if (editingInfo) {
        await axios.put(`http://localhost:5000/api/page-info/${editingInfo.id}`, submitData, getAuthHeaders());
        showNotification('Data berhasil diperbarui!', 'success');
      } else {
        await axios.post('http://localhost:5000/api/page-info', submitData, getAuthHeaders());
        showNotification('Data berhasil ditambahkan!', 'success');
      }
      
      fetchPageInfos();
      closeForm();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Terjadi kesalahan', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/page-info/${id}`, getAuthHeaders());
      showNotification('Data berhasil dihapus!', 'success');
      fetchPageInfos();
    } catch (err) {
      showNotification('Gagal menghapus data', 'error');
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
      misi: ['']
    });
    setPreviewImage('');
  };

  // Open form for editing existing info
  const openEditForm = (info) => {
    setIsAdding(true);
    setEditingInfo(info);
    setFormData({
      page_type: info.page_type,
      section_key: info.section_key || '',
      title: info.title || '',
      subtitle: info.subtitle || '',
      content: info.content || '',
      image_url: info.image_url || '',
      additional_data: info.additional_data || {},
      is_active: info.is_active,
      display_order: info.display_order || 1
    });
    setPreviewImage(info.image_url || '');

    // Load additional fields
    const additionalData = info.additional_data || {};
    setAdditionalFields({
      benefits: additionalData.benefits || [''],
      discount_percentage: additionalData.discount_percentage || '',
      whatsapp_number: additionalData.whatsapp_number || '',
      promo_label: additionalData.promo_label || '',
      visi: additionalData.visi || '',
      misi: additionalData.misi || ['']
    });
  };

  // Close form
  const closeForm = () => {
    setIsAdding(false);
    setEditingInfo(null);
  };

  // Filter page infos by type
  const filteredInfos = selectedPageType === 'all' 
    ? (Array.isArray(pageInfos) ? pageInfos : [])
    : (Array.isArray(pageInfos) ? pageInfos.filter(info => info.page_type === selectedPageType) : []);

  // Page type options
  const pageTypes = [
    { value: 'all', label: 'Semua', icon: FileText },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'about', label: 'About', icon: Users },
    { value: 'promo', label: 'Promo', icon: Tag }
  ];

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

        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .card-hover-effect {
          transition: all 0.3s ease;
        }

        .card-hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(62, 39, 35, 0.15);
        }

        .gradient-brown-text {
          background: linear-gradient(135deg, #3E2723 0%, #8D6E63 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-brown-bg {
          background: linear-gradient(135deg, #3E2723 0%, #8D6E63 100%);
        }

        .gradient-brown-hover {
          transition: all 0.3s ease;
        }

        .gradient-brown-hover:hover {
          background: linear-gradient(135deg, #3E2723 0%, #6D4C41 100%);
        }

        .gradient-gray-bg {
          background: linear-gradient(135deg, #4B5563 0%, #6B7280 100%);
        }

        .gradient-gray-hover {
          transition: all 0.3s ease;
        }

        .gradient-gray-hover:hover {
          background: linear-gradient(135deg, #374151 0%, #4B5563 100%);
        }

        .gradient-blue-bg {
          background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
        }

        .gradient-blue-hover {
          transition: all 0.3s ease;
        }

        .gradient-blue-hover:hover {
          background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%);
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }

        .backdrop-blur-custom {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
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
          background: #8D6E63;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6D4C41;
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
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold gradient-brown-text mb-2">
          Kelola Konten Website
        </h1>
        <p className="text-[#6D4C41]">
          Kelola informasi konten untuk halaman Home, About, dan Promo
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto custom-scrollbar">
          {pageTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedPageType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedPageType === type.value
                    ? 'gradient-brown-bg text-white shadow-lg'
                    : 'bg-white text-[#6D4C41] hover:bg-[#D7CCC8] border border-[#D7CCC8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Add Button */}
        <button
          onClick={openAddForm}
          className="gradient-gray-bg gradient-gray-hover text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Tambah Konten
        </button>
      </div>

      {/* Content Grid */}
      {filteredInfos.length === 0 ? (
        <div className="text-center py-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <FileText className="w-16 h-16 mx-auto mb-4 text-[#D7CCC8]" />
          <h3 className="text-xl font-semibold text-[#3E2723] mb-2">
            Belum Ada Konten
          </h3>
          <p className="text-[#6D4C41] mb-6">
            Mulai tambahkan konten untuk website Anda
          </p>
          <button
            onClick={openAddForm}
            className="gradient-gray-bg text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Konten Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfos.map((info, index) => (
            <div
              key={info.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {/* Image */}
              {info.image_url && (
                <div className="relative h-48 overflow-hidden bg-[#D7CCC8]">
                  <img
                    src={info.image_url}
                    alt={info.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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
              <div className="p-6">
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#D7CCC8] text-[#3E2723] px-3 py-1 rounded-full text-xs font-medium uppercase">
                    {info.page_type}
                  </span>
                  {info.section_key && (
                    <span className="bg-[#EFEBE9] text-[#6D4C41] px-3 py-1 rounded-full text-xs">
                      {info.section_key}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#3E2723] mb-2 hover:gradient-brown-text transition-all cursor-default">
                  {info.title || 'Tanpa Judul'}
                </h3>

                {/* Subtitle */}
                {info.subtitle && (
                  <p className="text-[#6D4C41] text-sm mb-3 font-medium">
                    {info.subtitle}
                  </p>
                )}

                {/* Content Preview */}
                {info.content && (
                  <p className="text-[#8D6E63] text-sm mb-4 line-clamp-3">
                    {info.content}
                  </p>
                )}

                {/* Additional Info */}
                {info.additional_data && Object.keys(info.additional_data).length > 0 && (
                  <div className="mb-4 p-3 bg-[#FDFBF7] rounded-lg border border-[#D7CCC8]">
                    <p className="text-xs text-[#6D4C41] font-medium">
                      Data Tambahan: {Object.keys(info.additional_data).length} field
                    </p>
                  </div>
                )}

                {/* Display Order */}
                <div className="mb-4 text-xs text-[#8D6E63]">
                  Urutan Tampilan: {info.display_order}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openEditForm(info)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                  >
                    <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(info.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isAdding && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-custom animate-fade-in"
          onClick={closeForm}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-[#D7CCC8] px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold gradient-brown-text">
                {editingInfo ? 'Edit Konten' : 'Tambah Konten Baru'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-[#D7CCC8] rounded-lg transition-all group"
              >
                <X className="w-6 h-6 text-[#3E2723] group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Page Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Tipe Halaman *
                  </label>
                  <select
                    name="page_type"
                    value={formData.page_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                  >
                    <option value="">Pilih Tipe Halaman</option>
                    <option value="home">Home</option>
                    <option value="about">About</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>

                {/* Section Key */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Section Key
                  </label>
                  <input
                    type="text"
                    name="section_key"
                    value={formData.section_key}
                    onChange={handleInputChange}
                    placeholder="Contoh: hero, vision, services"
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-[#8D6E63] mt-1">
                    Identifier unik untuk section (opsional)
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Judul
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul konten"
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Masukkan subtitle"
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Konten
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Masukkan konten detail"
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    URL Gambar
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={(e) => {
                        handleInputChange(e);
                        setPreviewImage(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage(formData.image_url)}
                      className="bg-[#8D6E63] hover:bg-[#6D4C41] text-white px-4 py-3 rounded-lg transition-all"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {previewImage && (
                    <div className="mt-3 rounded-lg overflow-hidden border-2 border-[#D7CCC8]">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={() => setPreviewImage('')}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Fields for Promo */}
                {formData.page_type === 'promo' && (
                  <div className="space-y-6 p-6 bg-[#FDFBF7] rounded-lg border-2 border-[#D7CCC8]">
                    <h3 className="font-bold text-[#3E2723] text-lg mb-4">Data Promo</h3>
                    
                    {/* Promo Label */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Label Promo
                      </label>
                      <input
                        type="text"
                        value={additionalFields.promo_label}
                        onChange={(e) => handleAdditionalFieldChange('promo_label', e.target.value)}
                        placeholder="Contoh: DISKON SPESIAL"
                        className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Discount Percentage */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Persentase Diskon (%)
                      </label>
                      <input
                        type="number"
                        value={additionalFields.discount_percentage}
                        onChange={(e) => handleAdditionalFieldChange('discount_percentage', e.target.value)}
                        placeholder="Contoh: 50"
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="text"
                        value={additionalFields.whatsapp_number}
                        onChange={(e) => handleAdditionalFieldChange('whatsapp_number', e.target.value)}
                        placeholder="Contoh: 628123456789"
                        className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Benefits */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Manfaat Promo
                      </label>
                      {additionalFields.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleAdditionalFieldChange('benefits', e.target.value, index)}
                            placeholder={`Manfaat ${index + 1}`}
                            className="flex-1 px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                          />
                          {additionalFields.benefits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="bg-[#8D6E63] hover:bg-[#6D4C41] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Manfaat
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Fields for About Vision */}
                {formData.page_type === 'about' && formData.section_key === 'vision' && (
                  <div className="space-y-6 p-6 bg-[#FDFBF7] rounded-lg border-2 border-[#D7CCC8]">
                    <h3 className="font-bold text-[#3E2723] text-lg mb-4">Visi & Misi</h3>
                    
                    {/* Visi */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Visi
                      </label>
                      <textarea
                        value={additionalFields.visi}
                        onChange={(e) => handleAdditionalFieldChange('visi', e.target.value)}
                        rows="3"
                        placeholder="Masukkan visi perusahaan"
                        className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    {/* Misi */}
                    <div>
                      <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                        Misi
                      </label>
                      {additionalFields.misi.map((misi, index) => (
                        <div key={index} className="flex gap-3 mb-3">
                          <input
                            type="text"
                            value={misi}
                            onChange={(e) => handleAdditionalFieldChange('misi', e.target.value, index)}
                            placeholder={`Misi ${index + 1}`}
                            className="flex-1 px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                          />
                          {additionalFields.misi.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMisi(index)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addMisi}
                        className="bg-[#8D6E63] hover:bg-[#6D4C41] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Misi
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-semibold text-[#3E2723] mb-2">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-[#D7CCC8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-[#8D6E63] mt-1">
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
                    className="w-5 h-5 text-[#8D6E63] border-2 border-[#D7CCC8] rounded focus:ring-2 focus:ring-[#8D6E63] cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-[#3E2723] cursor-pointer">
                    Aktifkan konten ini
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer - Sticky */}
            <div className="sticky bottom-0 bg-white border-t border-[#D7CCC8] px-6 py-4 rounded-b-2xl flex gap-3 justify-end z-10">
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-3 border-2 border-[#D7CCC8] text-[#3E2723] rounded-lg font-medium hover:bg-[#D7CCC8] transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className={`text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                  editingInfo
                    ? 'gradient-blue-bg gradient-blue-hover'
                    : 'gradient-gray-bg gradient-gray-hover'
                }`}
              >
                <Save className="w-5 h-5" />
                {editingInfo ? 'Perbarui' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContent;
