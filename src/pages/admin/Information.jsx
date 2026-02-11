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

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB');
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.onerror = () => {
      alert('Gagal membaca file');
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
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Perawatan': 'bg-purple-100 text-purple-800',
      'Produk': 'bg-blue-100 text-blue-800',
      'Promo': 'bg-pink-100 text-pink-800',
      'Pengumuman': 'bg-orange-100 text-orange-800',
      'Acara': 'bg-red-100 text-red-800',
      'Tips': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informasi & Artikel</h1>
          <p className="text-gray-500 mt-1">Kelola artikel dan informasi klinik</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">
                {isAdding ? 'Tambah Artikel Baru' : 'Edit Artikel'}
              </h2>
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Modal */}
            <div className="px-6 py-4 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Masukkan judul artikel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Penulis *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Nama penulis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all ${
            notification.show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            {/* Icon dan Header */}
            <div className="flex flex-col items-center text-center mb-4">
              {notification.type === 'success' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              <h3 className={`text-xl font-semibold mb-2 ${
                notification.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
              </h3>
              
              <p className="text-gray-600">
                {notification.message}
              </p>
            </div>

            {/* Button Close */}
            <button
              onClick={() => setNotification({ show: false, type: '', message: '' })}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                notification.type === 'success' 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-brown-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
              {cat !== 'Semua' && (
                <span className="ml-2 text-xs">
                  ({articles.filter(a => a.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Artikel</h3>
          <p className="text-gray-500">Klik tombol "Tambah Artikel" untuk membuat artikel baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}
    </div>
  );
};

export default Information;