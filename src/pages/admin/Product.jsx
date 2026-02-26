import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Semua Produk',
    price: '',
    weight: '', 
    description: '',
    image: '',
    marketplaceLinks: {
      shopee: '',
      tokopedia: '',
      lazada: '',
      other: ''
    },
    discountPercentage: 0,
    promoStartDate: '',
    promoEndDate: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'http://localhost:5000/api/products';
  
  const categories = ['Semua Produk', 'Acne', 'Brightening', 'Best Seller', 'Lainnya'];
  
  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      
      const productsData = Array.isArray(response.data) ? response.data : [];
      
      setProducts(productsData);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Gagal memuat produk';
      setError(errorMessage);
      console.error('Error memuat produk:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0  // Tambahkan ini untuk menghilangkan desimal
    }).format(number);
  };

  // Fungsi untuk cek apakah promo aktif
  const isPromoActive = (product) => {
    if (!product.discount_percentage || product.discount_percentage <= 0) return false;
    if (!product.promo_start_date || !product.promo_end_date) return false;
    
    const now = new Date();
    const startDate = new Date(product.promo_start_date);
    const endDate = new Date(product.promo_end_date);
    
    return now >= startDate && now <= endDate;
  };

  // Fungsi untuk hitung harga setelah diskon
  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discount = (price * discountPercentage) / 100;
    return price - discount;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Semua Produk',
      price: '',
      weight: '',
      description: '',
      image: '',
      marketplaceLinks: {
        shopee: '',
        tokopedia: '',
        lazada: '',
        other: ''
      },
      discountPercentage: 0,
      promoStartDate: '',
      promoEndDate: ''
    });
    setPreviewImage(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id || product.id);
    setIsAdding(false);
    
    // Ambil price langsung sebagai integer, bukan float
    const priceValue = parseInt(product.price) || 0;
    
    setFormData({
      name: product.name || '',
      category: product.category || 'Semua Produk',
      price: priceValue.toString(), // Convert integer ke string
      weight: (product.weight || 0).toString(),
      description: product.description || '',
      image: product.image || '',
      marketplaceLinks: product.marketplaceLinks || {
        shopee: '',
        tokopedia: '',
        lazada: '',
        other: ''
      },
      discountPercentage: product.discount_percentage || 0,
      promoStartDate: product.promo_start_date || '',
      promoEndDate: product.promo_end_date || ''
    });
    setPreviewImage(product.image);
  };

  const handleView = (product) => {
    setViewingProduct(product);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price) {
        setNotification({
          show: true,
          type: 'error',
          title: 'Validasi Gagal',
          message: 'Harap isi semua bidang wajib (Nama, Kategori, Harga)'
        });
        return;
      }

      const priceValue = parseInt(formData.price.toString().replace(/\D/g, '')) || 0;
      
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: priceValue,
        weight: parseInt(formData.weight) || 0,
        description: formData.description?.trim() || '',
        image: previewImage || formData.image || '',
        marketplaceLinks: formData.marketplaceLinks || {
          shopee: '',
          tokopedia: '',
          lazada: '',
          other: ''
        },
        discountPercentage: parseInt(formData.discountPercentage) || 0,
        promoStartDate: formData.promoStartDate || null,
        promoEndDate: formData.promoEndDate || null
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (isAdding) {
        const response = await axios.post(API_URL, productData, config);
        setProducts([response.data, ...products]);
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Produk baru berhasil ditambahkan'
        });
      } else {
        const response = await axios.put(`${API_URL}/${editingProduct}`, productData, config);
        setProducts(products.map(product => 
          product.id === editingProduct ? response.data : product
        ));
        setNotification({
          show: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Data produk berhasil diperbarui'
        });
      }

      handleCancel();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menyimpan produk';
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message: errorMessage
      });
      console.error('Error menyimpan produk:', err);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
    setFormData({
      name: '',
      category: 'Semua Produk',
      price: '',
      weight: '',
      description: '',
      image: '',
      marketplaceLinks: {
        shopee: '',
        tokopedia: '',
        lazada: '',
        other: ''
      },
      discountPercentage: 0,
      promoStartDate: '',
      promoEndDate: ''
    });
    setPreviewImage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProducts(products.filter(product => product.id !== id));
      setNotification({
        show: true,
        type: 'success',
        title: 'Berhasil!',
        message: 'Produk berhasil dihapus dari sistem'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menghapus produk';
      setNotification({
        show: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: errorMessage
      });
      console.error('Error menghapus produk:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // FIX: Hanya izinkan angka, tanpa formatting
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'weight') {
      // Untuk weight juga sama, hanya angka
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMarketplaceLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      marketplaceLinks: {
        ...prev.marketplaceLinks,
        [platform]: value
      }
    }));
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
      setFormData(prev => ({ ...prev, image: reader.result }));
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
    const url = e.target.value;
    setPreviewImage(url);
    setFormData(prev => ({ ...prev, image: url }));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px] p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brown-600 mx-auto"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Memuat produk...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Katalog Produk</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola produk kecantikan dan tautan marketplace.</p>
        </div>
        <button onClick={handleAdd} className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-brown-600 text-white text-sm sm:text-base rounded-lg hover:bg-brown-700 flex items-center justify-center transition-colors duration-200">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            Menampilkan {products.filter(product => 
              (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
            ).length} dari {products.length} produk
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Katalog Produk</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products
              .filter(product => 
                (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="h-40 sm:h-48 overflow-hidden bg-gray-100 relative">
                  <img 
                    src={product.image || 'https://via.placeholder.com/400x300?text=Tidak+Ada+Gambar'} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" 
                  />
                  {isPromoActive(product) && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                      PROMO {product.discount_percentage}%
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-full uppercase font-bold tracking-wider">
                          {product.category}
                        </span>
                        {product.weight && (
                          <span className="inline-block px-2 py-0.5 bg-brown-50 text-brown-600 text-[10px] sm:text-xs rounded-full font-medium">
                            {product.weight} gr
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {isPromoActive(product) ? (
                          <>
                            <div className="text-[10px] sm:text-xs text-gray-400 line-through">{formatRupiah(product.price)}</div>
                            <div className="text-sm sm:text-lg font-bold text-red-600">{formatRupiah(calculateDiscountedPrice(product.price, product.discount_percentage))}</div>
                          </>
                        ) : (
                          <div className="text-sm sm:text-lg font-bold text-brown-600">{formatRupiah(product.price)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                    {product.description || 'Tidak ada deskripsi'}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="text-[10px] sm:text-xs text-gray-500">ID: {product.id || product._id}</div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <button onClick={() => handleView(product)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded hover:bg-gray-200 transition-colors duration-200">
                        Lihat
                      </button>
                      <button onClick={() => handleEdit(product)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 text-white text-[10px] sm:text-xs rounded hover:bg-blue-700 transition-colors duration-200">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 text-white text-[10px] sm:text-xs rounded hover:bg-red-600 transition-colors duration-200">
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Mulai tambahkan produk pertama Anda</p>
            <button onClick={handleAdd} className="px-4 py-2 bg-brown-600 text-white text-sm sm:text-base rounded-lg hover:bg-brown-700 transition-colors duration-200">
              Tambah Produk
            </button>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              {isAdding ? 'Tambah Produk Baru' : 'Edit Produk'}
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {/* Bagian Input Gambar */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                <div className="mb-3 sm:mb-4">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                        <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-sans text-sm">
                        Unggah atau tempel URL
                      </div>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brown-50 file:text-brown-700" 
                />
                <input 
                  type="text" 
                  value={previewImage || ''} 
                  onChange={handleImageUrlChange} 
                  placeholder="URL Gambar" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-2" 
                />
              </div>

              {/* Nama & Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="category" 
                    value={formData.category || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                    required
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Harga & Berat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Harga <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <span className="text-xs sm:text-sm text-gray-500">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      name="price" 
                      value={formData.price || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                      required 
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Preview: {formData.price ? formatRupiah(formData.price) : 'Rp 0'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Berat (Gram)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="weight" 
                      value={formData.weight || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                      placeholder="0" 
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-xs sm:text-sm">gr</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base" 
                />
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">Tautan Marketplace</h4>
                <div className="space-y-2 sm:space-y-3">
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.shopee || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('shopee', e.target.value)} 
                    placeholder="URL Shopee" 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.tokopedia || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('tokopedia', e.target.value)} 
                    placeholder="URL Tokopedia" 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.lazada || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('lazada', e.target.value)} 
                    placeholder="URL Lazada" 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.other || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('other', e.target.value)} 
                    placeholder="URL Marketplace Lainnya" 
                    className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm" 
                  /> 
                </div>
              </div>

              {/* Promo Section */}
              <div className="border-t pt-3 sm:pt-4">
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
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
              <button onClick={handleCancel} className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Batal
              </button>
              <button onClick={handleSave} className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-brown-600 text-white rounded-lg hover:bg-brown-700">
                {isAdding ? 'Tambah Produk' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-3 sm:p-4 w-full sm:min-w-[320px] sm:max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <h3 className={`text-xs sm:text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h3>
                <p className={`mt-0.5 sm:mt-1 text-xs sm:text-sm ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-2 sm:ml-4 flex-shrink-0 rounded-md inline-flex ${
                  notification.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'
                }`}>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIHAT PRODUK */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 pr-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{viewingProduct.name}</h3>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1 uppercase font-bold tracking-wider">
                  {viewingProduct.category}
                </span>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <img 
                  src={viewingProduct.image || 'https://via.placeholder.com/400x300?text=Tidak+Ada+Gambar'} 
                  className="w-full h-48 sm:h-64 object-cover rounded-lg" 
                  alt={viewingProduct.name} 
                />
                {viewingProduct.weight && (
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span className="font-medium">{viewingProduct.weight} gram</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Harga</label>
                  {isPromoActive(viewingProduct) ? (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base text-gray-400 line-through">{formatRupiah(viewingProduct.price)}</span>
                        <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                          -{viewingProduct.discount_percentage}%
                        </span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-red-600">
                        {formatRupiah(calculateDiscountedPrice(viewingProduct.price, viewingProduct.discount_percentage))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl sm:text-2xl font-bold text-brown-600 mt-1">{formatRupiah(viewingProduct.price)}</div>
                  )}
                </div>

                {/* Info Promo */}
                {isPromoActive(viewingProduct) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs sm:text-sm font-bold text-red-800 mb-2">🎉 Promo Aktif!</p>
                    <div className="text-xs sm:text-sm text-red-700">
                      <p>Diskon: <span className="font-bold">{viewingProduct.discount_percentage}%</span></p>
                      <p>Periode: {new Date(viewingProduct.promo_start_date).toLocaleDateString('id-ID')} - {new Date(viewingProduct.promo_end_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Deskripsi</label>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{viewingProduct.description || 'Tidak ada deskripsi'}</p>
                </div>
                
                {/* Marketplace Links */}
                {(viewingProduct.marketplaceLinks?.shopee || viewingProduct.marketplaceLinks?.tokopedia || viewingProduct.marketplaceLinks?.lazada || viewingProduct.marketplaceLinks?.other) && (
                  <div className="pt-3 border-t border-gray-200">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Link Marketplace</label>
                    <div className="space-y-2">
                      {viewingProduct.marketplaceLinks?.shopee && (
                        <a href={viewingProduct.marketplaceLinks.shopee} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs sm:text-sm text-orange-600 hover:text-orange-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                          Shopee
                        </a>
                      )}
                      {viewingProduct.marketplaceLinks?.tokopedia && (
                        <a href={viewingProduct.marketplaceLinks.tokopedia} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs sm:text-sm text-green-600 hover:text-green-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                          Tokopedia
                        </a>
                      )}
                      {viewingProduct.marketplaceLinks?.lazada && (
                        <a href={viewingProduct.marketplaceLinks.lazada} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                          Lazada
                        </a>
                      )}
                      {viewingProduct.marketplaceLinks?.other && (
                        <a href={viewingProduct.marketplaceLinks.other} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                          Marketplace Lainnya
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4 sm:mt-6">
              <button onClick={() => setViewingProduct(null)} className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-brown-600 text-white rounded-lg hover:bg-brown-700">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;