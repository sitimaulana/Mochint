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
    }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/products';
  
  const categories = ['Semua Produk', 'Acne', 'Brightening', 'Best Seller', 'Lainnya'];
  
  useEffect(() => {
    fetchProducts();
  }, []);

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
      }
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
      }
    });
    setPreviewImage(product.image);
  };

  const handleView = (product) => {
    setViewingProduct(product);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price) {
        alert('Harap isi semua bidang wajib (Nama, Kategori, Harga)');
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
        }
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
      } else {
        const response = await axios.put(`${API_URL}/${editingProduct}`, productData, config);
        setProducts(products.map(product => 
          product.id === editingProduct ? response.data : product
        ));
      }

      handleCancel();
      alert('Produk berhasil disimpan!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menyimpan produk';
      alert(errorMessage);
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
      }
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
      alert('Produk berhasil dihapus!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal menghapus produk';
      alert(errorMessage);
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
    if (file) {
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Katalog Produk</h1>
          <p className="text-gray-600">Kelola produk kecantikan dan tautan marketplace.</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Katalog Produk</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={product.image || 'https://via.placeholder.com/400x300?text=Tidak+Ada+Gambar'} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <div className="flex gap-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1 uppercase font-bold tracking-wider">
                          {product.category}
                        </span>
                        {product.weight && (
                          <span className="inline-block px-2 py-1 bg-brown-50 text-brown-600 text-xs rounded-full mt-1 font-medium">
                            {product.weight} gr
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brown-600">{formatRupiah(product.price)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description || 'Tidak ada deskripsi'}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">ID: {product.id || product._id}</div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(product)} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">
                        Lihat
                      </button>
                      <button onClick={() => handleEdit(product)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">Tidak ada produk ditemukan.</div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isAdding ? 'Tambah Produk Baru' : 'Edit Produk'}
            </h3>
            <div className="space-y-6">
              {/* Bagian Input Gambar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                <div className="mb-4">
                  <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="category" 
                    value={formData.category || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    required
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Harga & Berat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">Rp</span>
                    </div>
                    <input 
                      type="text" 
                      name="price" 
                      value={formData.price || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2" 
                      required 
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Preview: {formData.price ? formatRupiah(formData.price) : 'Rp 0'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berat (Gram)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="weight" 
                      value={formData.weight || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-md px-3 py-2" 
                      placeholder="0" 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">gr</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2" 
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Tautan Marketplace</h4>
                <div className="space-y-3">
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.shopee || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('shopee', e.target.value)} 
                    placeholder="URL Shopee" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.tokopedia || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('tokopedia', e.target.value)} 
                    placeholder="URL Tokopedia" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.lazada || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('lazada', e.target.value)} 
                    placeholder="URL Lazada" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
                  />
                  <input 
                    type="url" 
                    value={formData.marketplaceLinks?.other || ''} 
                    onChange={(e) => handleMarketplaceLinkChange('other', e.target.value)} 
                    placeholder="URL Marketplace Lainnya" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
                  /> 
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Batal
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700">
                {isAdding ? 'Tambah Produk' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIHAT PRODUK */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{viewingProduct.name}</h3>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img 
                src={viewingProduct.image || 'https://via.placeholder.com/400x300?text=Tidak+Ada+Gambar'} 
                className="w-full h-64 object-cover rounded-lg" 
                alt={viewingProduct.name} 
              />
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategori</label>
                  <div className="mt-1 font-sans text-sm uppercase">{viewingProduct.category}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Berat</label>
                  <div className="mt-1 font-sans text-sm">{viewingProduct.weight || 0} gram</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Harga</label>
                  <div className="text-2xl font-bold text-brown-600">{formatRupiah(viewingProduct.price)}</div>
                </div>
                <p className="text-gray-600 text-sm">{viewingProduct.description || 'Tidak ada deskripsi'}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewingProduct(null)} className="px-4 py-2 bg-brown-600 text-white rounded-lg">
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