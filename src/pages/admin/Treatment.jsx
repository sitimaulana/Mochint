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
    image: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:5000/api/treatments';

  // Fetch treatments dari API
  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTreatments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch treatments. Please try again.');
      console.error('Error fetching treatments:', err);
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
      image: ''
    });
    setPreviewImage(null);
  };

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment._id || treatment.id);
    setIsAdding(false);
    setFormData({
      ...treatment,
      price: treatment.price.toString().replace(/\D/g, '') || '0'
    });
    setPreviewImage(treatment.image);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || !formData.duration) {
        alert('Please fill in all required fields');
        return;
      }

      const priceValue = parseRupiah(formData.price);
      const treatmentData = {
        name: formData.name,
        category: formData.category,
        duration: formData.duration,
        price: priceValue,
        description: formData.description || '',
        image: previewImage || formData.image || ''
      };

      if (isAdding) {
        // Create new treatment
        const response = await axios.post(API_URL, treatmentData);
        setTreatments([response.data, ...treatments]);
        setIsAdding(false);
      } else {
        // Update existing treatment
        const response = await axios.put(`${API_URL}/${editingTreatment}`, treatmentData);
        setTreatments(treatments.map(treatment => 
          (treatment._id || treatment.id) === editingTreatment ? response.data : treatment
        ));
      }

      handleCancel();
    } catch (err) {
      alert('Failed to save treatment. Please try again.');
      console.error('Error saving treatment:', err);
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
      image: ''
    });
    setPreviewImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTreatments(treatments.filter(treatment => (treatment._id || treatment.id) !== id));
      } catch (err) {
        alert('Failed to delete treatment. Please try again.');
        console.error('Error deleting treatment:', err);
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
  if (error && treatments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Treatments</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTreatments}
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
          <h1 className="text-2xl font-bold text-gray-800">Treatments</h1>
          <p className="text-gray-600">Manage available treatments and services.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Treatment
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

      {/* Treatments Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatments.map((treatment) => (
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
                    e.target.src = 'https://via.placeholder.com/400x300?text=Treatment';
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
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {treatment.duration}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  4.8
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {isAdding ? 'Add New Treatment' : 'Edit Treatment'}
            </h3>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Image</label>
              
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
                      <span className="text-sm">Upload treatment image</span>
                      <span className="text-xs mt-1">Recommended: 800x600 px</span>
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
                    placeholder="https://example.com/treatment-image.jpg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Treatment Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter treatment name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    <option value="Facial">Facial</option>
                    <option value="Massage">Massage</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Nail Care">Nail Care</option>
                    <option value="Spa">Spa</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Waxing">Waxing</option>
                    <option value="Laser Treatment">Laser Treatment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Duration</option>
                    <option value="30 min">30 minutes</option>
                    <option value="45 min">45 minutes</option>
                    <option value="60 min">60 minutes</option>
                    <option value="90 min">90 minutes</option>
                    <option value="120 min">120 minutes</option>
                    <option value="150 min">150 minutes</option>
                    <option value="180 min">180 minutes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
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
                  Final price will be displayed as: {formatRupiah(formData.price)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="4"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Describe the treatment details, benefits, etc."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
              >
                {isAdding ? 'Add Treatment' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {treatments.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No treatments found</h3>
          <p className="text-gray-500 mb-6">Start by adding your first treatment to the clinic.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
          >
            Add Treatment
          </button>
        </div>
      )}
    </div>
  );
};

export default Treatment;