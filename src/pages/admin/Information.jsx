import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Information = () => {
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Pengumuman',
    status: 'Draft',
    image: '',
    author: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // API base URL
  const API_URL = 'http://localhost:5000/api/articles';
  const Token = localStorage.getItem('token');

  // Kategori yang tersedia
  const categories = ['Semua', 'Perawatan', 'Produk', 'Promo', 'Pengumuman', 'Acara', 'Tips'];

  // Ambil artikel dari API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL, {
        headers: {Authorization: `Bearer ${Token}`
        }
      });
      setArticles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Gagal memuat artikel';
      setError(errorMessage);
      console.error('Error memuat artikel:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter artikel berdasarkan kategori
  const filteredArticles = selectedCategory === 'Semua' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      category: 'Pengumuman',
      status: 'Draft',
      image: '',
      author: localStorage.getItem('userName') || ''
    });
    setPreviewImage(null);
    setError(null);
  };

  const handleEdit = (article) => {
    setEditingArticle(article._id || article.id);
    setIsAdding(false);
    setFormData({
      title: article.title || '',
      content: article.content || '',
      category: article.category || 'Pengumuman',
      status: article.status || 'Draft',
      image: article.image || '',
      author: article.author || ''
    });
    setPreviewImage(article.image || null);
    setError(null);
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.title?.trim()) {
      setError('Judul artikel wajib diisi');
      return;
    }

    if (!formData.content?.trim()) {
      setError('Konten artikel wajib diisi');
      return;
    }

    if (!formData.author?.trim()) {
      setError('Penulis wajib diisi');
      return;
    }

    setSaveLoading(true);
    setError(null);

    try {
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        status: formData.status,
        image: previewImage || formData.image || '',
        author: formData.author.trim()
      };

      let response;
      if (isAdding) {
        response = await axios.post(API_URL, articleData, {
          headers: {
            Authorization: `Bearer ${Token}`,
            'Content-Type': 'application/json'
          }
        });
        setArticles([response.data, ...articles]);
        showNotification('success', 'Artikel berhasil ditambahkan');
      } else {
        response = await axios.put(`${API_URL}/${editingArticle}`, articleData, {
          headers: {
            Authorization: `Bearer ${Token}`,
            'Content-Type': 'application/json'
          }
        });
        setArticles(articles.map(article => 
          (article._id || article.id) === editingArticle ? response.data : article
        ));
        showNotification('success', 'Artikel berhasil diperbarui');
      }

      handleCancel();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menyimpan artikel';
      setError(errorMessage);
      console.error('Error menyimpan artikel:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setIsAdding(false);
    setFormData({
      title: '',
      content: '',
      category: 'Pengumuman',
      status: 'Draft',
      image: '',
      author: ''
    });
    setPreviewImage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`
        }
      });
      setArticles(articles.filter(article => (article._id || article.id) !== id));
      showNotification('success', 'Artikel berhasil dihapus');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menghapus artikel';
      console.error('Error menghapus artikel:', err);
      showNotification('error', errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error saat user mulai mengetik
    if (error) setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification('error', 'Ukuran file terlalu besar. Maksimal 2MB. Silakan pilih file yang lebih kecil.');
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'File harus berupa gambar (JPG, PNG, GIF). Silakan pilih file gambar.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
      showNotification('success', 'Gambar berhasil diupload dan siap disimpan.');
    };
    reader.onerror = () => {
      showNotification('error', 'Gagal membaca file. Terjadi kesalahan saat membaca file, silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setPreviewImage(url);
    setFormData(prev => ({ ...prev, image: url }));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    // Auto close setelah 3 detik
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
      
      const response = await axios.put(`${API_URL}/${id}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            'Content-Type': 'application/json'
          }

        }
      );
      
      setArticles(articles.map(article => 
        (article._id || article.id) === id ? response.data : article
      ));
      setError(null);
      
      // Tampilkan notifikasi sukses
      showNotification('success', `Artikel berhasil di${newStatus === 'Published' ? 'publish' : 'unpublish'}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal memperbarui status';
      console.error('Error memperbarui status:', err);
      
      // Tampilkan notifikasi error
      showNotification('error', errorMessage);
    }
  };

  const getStatusColor = (status) => {
    return status === 'Published' 
      ? 'bg-brown-100 text-brown-800' 
      : 'bg-brown-100 text-brown-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Perawatan': 'bg-brown-100 text-brown-800',
      'Produk': 'bg-brown-100 text-brown-800',
      'Promo': 'bg-brown-100 text-brown-800',
      'Pengumuman': 'bg-brown-100 text-brown-800',
      'Acara': 'bg-brown-100 text-brown-800',
      'Tips': 'bg-brown-100 text-brown-800'
    };
    return colors[category] || 'bg-brown-100 text-brown-800';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Informasi & Artikel</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Kelola artikel dan informasi klinik</p>
        </div>
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-brown-600 text-white text-sm sm:text-base rounded-lg hover:bg-brown-700 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Artikel
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal Pop-up Tambah/Edit */}
      {(isAdding || editingArticle) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                {isAdding ? 'Tambah Artikel Baru' : 'Edit Artikel'}
              </h2>
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Modal */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              {/* Error Message dalam Modal */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Terjadi Kesalahan</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Masukkan judul artikel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    {categories.filter(c => c !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Penulis *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Nama penulis"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Konten *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Tulis konten artikel di sini..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500">atau</p>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={handleImageUrlChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Masukkan URL gambar"
                  />
                </div>
                {previewImage && (
                  <div className="mt-3 relative inline-block">
                    <img src={previewImage} alt="Preview" className="h-32 w-auto rounded-lg" />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-xl">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 px-6 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saveLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notifikasi Status */}
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
                  {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
                </h3>
                <p className={`mt-1 text-sm ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
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

      {/* Filter & View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brown-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
                {cat !== 'Semua' && (
                  <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                    ({articles.filter(a => a.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-brown-600 shadow-sm'
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
                  ? 'bg-white text-brown-600 shadow-sm'
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
        </div>
      </div>

      {/* Articles Grid/List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Belum Ada Artikel</h3>
          <p className="text-sm sm:text-base text-gray-500">Klik tombol "Tambah Artikel" untuk membuat artikel baru</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map(article => (
            <div key={article._id || article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {article.image && (
                <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Oleh: {article.author}</span>
                  <span>{new Date(article.createdAt || Date.now()).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(article._id || article.id, article.status)}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                  >
                    {article.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(article._id || article.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredArticles.map(article => (
            <div key={article._id || article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                {article.image && (
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full sm:w-48 h-48 sm:h-auto object-cover flex-shrink-0" 
                  />
                )}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg sm:text-xl mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">{article.content}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(article.createdAt || Date.now()).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs sm:text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(article._id || article.id, article.status)}
                        className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs sm:text-sm font-medium transition-colors"
                      >
                        {article.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(article._id || article.id)}
                        className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs sm:text-sm font-medium transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Information;