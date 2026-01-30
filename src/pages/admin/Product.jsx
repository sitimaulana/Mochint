import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'All Products',
    price: '0',
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
  
  // SINKRONISASI KATEGORI DENGAN HALAMAN MEMBER
  const categories = ['All Products', 'Acne', 'Brightening', 'Best Seller', 'Other'];

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

  const formatRupiah = (angka) => {
    const number = parseInt(angka) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const parseRupiah = (rupiah) => {
    return parseInt(rupiah.toString().replace(/\D/g, '')) || 0;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'All Products',
      price: '0',
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
    setFormData({
      ...product,
      price: product.price.toString().replace(/\D/g, '') || '0',
      weight: product.weight || '',
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
        alert('Please fill in all required fields (Name, Category, Price)');
        return;
      }

      const priceValue = parseRupiah(formData.price);
      
      // LOGIKA PENERIMAAN DATA BERAT: Pastikan dikirim sebagai Integer
      const productData = {
        name: formData.name,
        category: formData.category,
        price: priceValue,
        weight: parseInt(formData.weight) || 0, // Diterima sebagai angka (INT)
        description: formData.description || '',
        image: previewImage || formData.image || '',
        marketplaceLinks: formData.marketplaceLinks || {}
      };

      if (isAdding) {
        const response = await axios.post(API_URL, productData);
        setProducts([response.data, ...products]);
        setIsAdding(false);
      } else {
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
      category: 'All Products',
      price: '0',
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Catalog</h1>
          <p className="text-gray-600">Manage beauty products and marketplace links.</p>
        </div>
        <button onClick={handleAdd} className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Catalog</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <div className="flex gap-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1 uppercase font-bold tracking-wider">{product.category}</span>
                        {/* Menampilkan Weight di Card */}
                        {product.weight && <span className="inline-block px-2 py-1 bg-brown-50 text-brown-600 text-xs rounded-full mt-1 font-medium">{product.weight} gr</span>}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brown-600">{formatRupiah(product.price)}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">ID: {product.id || product._id}</div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(product)} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">View</button>
                      <button onClick={() => handleEdit(product)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">Edit</button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No products found.</div>
        )}
      </div>

      {/* MODAL ADD/EDIT */}
      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{isAdding ? 'Add New Product' : 'Edit Product'}</h3>
            <div className="space-y-6">
              {/* Image Input Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="mb-4"><div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">{previewImage ? <div className="relative w-full h-full"><img src={previewImage} className="w-full h-full object-cover" /><button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 font-sans text-sm">Upload or paste URL</div>}</div></div>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brown-50 file:text-brown-700" />
                <input type="text" value={previewImage || ''} onChange={handleImageUrlChange} placeholder="Image URL" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-2" />
              </div>

              {/* Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500">Rp</span></div>
                    <input type="text" name="price" value={formData.price || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Gram)</label>
                  <div className="relative">
                    <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="0" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 text-sm">gr</span></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Marketplace Links</h4>
                <div className="space-y-3">
                  <input type="url" value={formData.marketplaceLinks?.shopee || ''} onChange={(e) => handleMarketplaceLinkChange('shopee', e.target.value)} placeholder="Shopee URL" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  <input type="url" value={formData.marketplaceLinks?.tokopedia || ''} onChange={(e) => handleMarketplaceLinkChange('tokopedia', e.target.value)} placeholder="Tokopedia URL" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  <input type="url" value={formData.marketplaceLinks?.lazada || ''} onChange={(e) => handleMarketplaceLinkChange('lazada', e.target.value)} placeholder="Lazada URL" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  <input type="url" value={formData.marketplaceLinks?.other || ''} onChange={(e) => handleMarketplaceLinkChange('other', e.target.value)} placeholder="Other Marketplace URL" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /> 
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700">{isAdding ? 'Add Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{viewingProduct.name}</h3>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img src={viewingProduct.image} className="w-full h-64 object-cover rounded-lg" alt={viewingProduct.name} />
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700">Category</label><div className="mt-1 font-sans text-sm uppercase">{viewingProduct.category}</div></div>
                <div><label className="text-sm font-medium text-gray-700">Weight</label><div className="mt-1 font-sans text-sm">{viewingProduct.weight || 0} gr</div></div>
                <div><label className="text-sm font-medium text-gray-700">Price</label><div className="text-2xl font-bold text-brown-600">{formatRupiah(viewingProduct.price)}</div></div>
                <p className="text-gray-600 text-sm">{viewingProduct.description}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setViewingProduct(null)} className="px-4 py-2 bg-brown-600 text-white rounded-lg">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;