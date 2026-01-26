import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '0',
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

  // API base URL
  const API_URL = 'http://localhost:5000/api/products';

  const categories = ['Skincare', 'Hair Care', 'Body Care', 'Makeup', 'Fragrance', 'Tools', 'Other'];

  // Fetch products dari API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Parse Rupiah untuk input
  const parseRupiah = (rupiah) => {
    return parseInt(rupiah.toString().replace(/\D/g, '')) || 0;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      category: '',
      price: '0',
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
    setFormData({
      ...product,
      price: product.price.toString().replace(/\D/g, '') || '0',
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
      // Validasi form
      if (!formData.name || !formData.category || !formData.price) {
        alert('Please fill in all required fields (Name, Category, Price)');
        return;
      }

      const priceValue = parseRupiah(formData.price);
      const productData = {
        name: formData.name,
        category: formData.category,
        price: priceValue,
        description: formData.description || '',
        image: previewImage || formData.image || '',
        marketplaceLinks: formData.marketplaceLinks || {}
      };

      if (isAdding) {
        // Create new product
        const response = await axios.post(API_URL, productData);
        setProducts([response.data, ...products]);
        setIsAdding(false);
      } else {
        // Update existing product
        const response = await axios.put(`${API_URL}/${editingProduct}`, productData);
        setProducts(products.map(product => 
          (product._id || product.id) === editingProduct ? response.data : product
        ));
      }

      handleCancel();
    } catch (err) {
      alert('Failed to save product. Please try again.');
      console.error('Error saving product:', err);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
    setFormData({
      name: '',
      category: '',
      price: '0',
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(product => (product._id || product.id) !== id));
      } catch (err) {
        alert('Failed to delete product. Please try again.');
        console.error('Error deleting product:', err);
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
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
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
    if (url) {
      // Validasi URL sederhana
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
      }
    }
    setPreviewImage(url);
    setFormData(prev => ({ ...prev, image: url }));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
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
  if (error && products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Catalog</h1>
          <p className="text-gray-600">Manage beauty products and marketplace links.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
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

      {/* Products Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Catalog</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Product Image */}
                <div className="h-48 overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-brown-600">
                      {formatRupiah(product.price)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description || 'No description'}
                  </p>

                  {/* Marketplace Links */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {product.marketplaceLinks?.shopee && (
                        <a 
                          href={product.marketplaceLinks.shopee}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded hover:bg-orange-100"
                        >
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5h-2v-7h2v7zm6-7.5h-4v1h2.5v5.5h-1.5v-4h-1v4H11v-6h1v-1h-1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/>
                          </svg>
                          Shopee
                        </a>
                      )}
                      {product.marketplaceLinks?.tokopedia && (
                        <a 
                          href={product.marketplaceLinks.tokopedia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100"
                        >
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Tokopedia
                        </a>
                      )}
                      {product.marketplaceLinks?.lazada && (
                        <a 
                          href={product.marketplaceLinks.lazada}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100"
                        >
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7a.996.996 0 111.41-1.41L10 14.17l6.88-6.88a.996.996 0 111.41 1.41l-7.59 7.59a.996.996 0 01-1.41 0z"/>
                          </svg>
                          Lazada
                        </a>
                      )}
                      {product.marketplaceLinks?.other && (
                        <a 
                          href={product.marketplaceLinks.other}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded hover:bg-gray-100"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Other
                        </a>
                      )}
                      {Object.keys(product.marketplaceLinks || {}).length === 0 && (
                        <span className="text-xs text-gray-500">No marketplace links</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">ID: {product.id || product._id}</div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(product)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id || product.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              Add New Product
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isAdding ? 'Add New Product' : 'Edit Product'}
            </h3>
            
            {/* Product Details Form */}
            <div className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                
                {/* Image Preview */}
                <div className="mb-4">
                  <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Upload or paste image URL</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Options */}
                <div className="space-y-3">
                  {/* Upload from Computer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                  </div>

                  {/* OR Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={previewImage || ''}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price <span className="text-red-500">*</span>
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
                    placeholder="0"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Final price will be displayed as: {formatRupiah(formData.price)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter product description"
                />
              </div>

              {/* Marketplace Links Section */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Marketplace Links</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shopee URL</label>
                    <input
                      type="url"
                      value={formData.marketplaceLinks?.shopee || ''}
                      onChange={(e) => handleMarketplaceLinkChange('shopee', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://shopee.co.id/your-product"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tokopedia URL</label>
                    <input
                      type="url"
                      value={formData.marketplaceLinks?.tokopedia || ''}
                      onChange={(e) => handleMarketplaceLinkChange('tokopedia', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://tokopedia.com/your-product"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lazada URL</label>
                    <input
                      type="url"
                      value={formData.marketplaceLinks?.lazada || ''}
                      onChange={(e) => handleMarketplaceLinkChange('lazada', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://lazada.co.id/your-product"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Marketplace URL</label>
                    <input
                      type="url"
                      value={formData.marketplaceLinks?.other || ''}
                      onChange={(e) => handleMarketplaceLinkChange('other', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://yourmarketplace.com/product"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
              >
                {isAdding ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{viewingProduct.name}</h3>
                <p className="text-sm text-gray-600">ID: {viewingProduct.id || viewingProduct._id}</p>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div>
                <div className="rounded-lg overflow-hidden bg-gray-100 h-64">
                  {viewingProduct.image ? (
                    <img 
                      src={viewingProduct.image} 
                      alt={viewingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {viewingProduct.category}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <div className="text-2xl font-bold text-brown-600 mt-1">
                    {formatRupiah(viewingProduct.price)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-600">{viewingProduct.description || 'No description available'}</p>
                </div>

                {/* Marketplace Links */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Available on:</label>
                  <div className="space-y-2">
                    {viewingProduct.marketplaceLinks?.shopee && (
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-orange-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5h-2v-7h2v7zm6-7.5h-4v1h2.5v5.5h-1.5v-4h-1v4H11v-6h1v-1h-1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/>
                          </svg>
                          <span className="text-sm">Shopee</span>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={viewingProduct.marketplaceLinks.shopee}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors duration-200"
                          >
                            Visit
                          </a>
                          <button
                            onClick={() => copyToClipboard(viewingProduct.marketplaceLinks.shopee)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {viewingProduct.marketplaceLinks?.tokopedia && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-sm">Tokopedia</span>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={viewingProduct.marketplaceLinks.tokopedia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors duration-200"
                          >
                            Visit
                          </a>
                          <button
                            onClick={() => copyToClipboard(viewingProduct.marketplaceLinks.tokopedia)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {viewingProduct.marketplaceLinks?.lazada && (
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7a.996.996 0 111.41-1.41L10 14.17l6.88-6.88a.996.996 0 111.41 1.41l-7.59 7.59a.996.996 0 01-1.41 0z"/>
                          </svg>
                          <span className="text-sm">Lazada</span>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={viewingProduct.marketplaceLinks.lazada}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200"
                          >
                            Visit
                          </a>
                          <button
                            onClick={() => copyToClipboard(viewingProduct.marketplaceLinks.lazada)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {viewingProduct.marketplaceLinks?.other && (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-sm">Other Marketplace</span>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={viewingProduct.marketplaceLinks.other}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors duration-200"
                          >
                            Visit
                          </a>
                          <button
                            onClick={() => copyToClipboard(viewingProduct.marketplaceLinks.other)}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {Object.keys(viewingProduct.marketplaceLinks || {}).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No marketplace links available for this product
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;