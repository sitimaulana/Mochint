import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Information = () => {
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Announcement',
    status: 'Draft',
    image: '',
    author: 'Admin'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:5000/api/articles';

  // Kategori yang tersedia
  const categories = ['All', 'Treatment', 'Product', 'Promotion', 'Announcement', 'Event', 'Tips'];

  // Fetch articles dari API
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setArticles(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch articles. Please try again.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter artikel berdasarkan kategori
  const filteredArticles = selectedCategory === 'All' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      category: 'Announcement',
      status: 'Draft',
      image: '',
      author: 'Admin'
    });
    setPreviewImage(null);
  };

  const handleEdit = (article) => {
    setEditingArticle(article._id || article.id);
    setIsAdding(false);
    setFormData(article);
    setPreviewImage(article.image);
  };

  const handleSave = async () => {
    try {
      const articleData = {
        ...formData,
        image: previewImage || formData.image
      };

      if (isAdding) {
        // Create new article
        const response = await axios.post(API_URL, articleData);
        setArticles([response.data, ...articles]);
        setIsAdding(false);
      } else {
        // Update existing article
        const response = await axios.put(`${API_URL}/${editingArticle}`, articleData);
        setArticles(articles.map(article => 
          (article._id || article.id) === editingArticle ? response.data : article
        ));
      }

      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        category: 'Announcement',
        status: 'Draft',
        image: '',
        author: 'Admin'
      });
      setPreviewImage(null);
    } catch (err) {
      setError('Failed to save article. Please try again.');
      console.error('Error saving article:', err);
    }
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setIsAdding(false);
    setFormData({
      title: '',
      content: '',
      category: 'Announcement',
      status: 'Draft',
      image: '',
      author: 'Admin'
    });
    setPreviewImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setArticles(articles.filter(article => (article._id || article.id) !== id));
      } catch (err) {
        setError('Failed to delete article. Please try again.');
        console.error('Error deleting article:', err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
      const response = await axios.patch(`${API_URL}/${id}/status`, { status: newStatus });
      
      setArticles(articles.map(article => 
        (article._id || article.id) === id ? response.data : article
      ));
    } catch (err) {
      setError('Failed to update status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status) => {
    return status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Treatment': 'bg-brown-100 text-brown-800',
      'Product': 'bg-blue-100 text-blue-800',
      'Promotion': 'bg-pink-100 text-pink-800',
      'Announcement': 'bg-orange-100 text-orange-800',
      'Event': 'bg-red-100 text-red-800',
      'Tips': 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
  if (error && articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Articles</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchArticles}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Information & News</h1>
          <p className="text-gray-600">Manage articles, announcements, and clinic information.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Article
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

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-brown-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-brown-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-brown-600">{articles.length}</div>
            <div className="text-sm text-gray-600">Total Articles</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {articles.filter(a => a.status === 'Published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{categories.length - 1}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Articles Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article._id || article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Article Image */}
              <div className="h-48 bg-gray-100 relative">
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x500?text=Article+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{article.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.content}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(article.createdAt || article.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {article.author}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="flex-1 px-3 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(article._id || article.id, article.status)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      article.status === 'Published'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {article.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(article._id || article.id)}
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
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 pl-6">Image</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Author</th>
                <th className="pb-3 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article._id || article.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pl-6">
                    <div className="w-16 h-12 rounded overflow-hidden bg-gray-100">
                      {article.image ? (
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-800">{article.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{article.content.substring(0, 60)}...</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {new Date(article.createdAt || article.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 text-sm text-gray-500">{article.author}</td>
                  <td className="py-3 pr-6 space-x-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(article._id || article.id, article.status)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        article.status === 'Published'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {article.status === 'Published' ? 'Unpub' : 'Pub'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Add Modal */}
      {(editingArticle || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {isAdding ? 'Create New Article' : 'Edit Article'}
            </h3>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Featured Image</label>
              
              {/* Image Preview */}
              <div className="mb-4 flex justify-center">
                <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
                      <span className="text-sm">Upload article featured image</span>
                      <span className="text-xs mt-1">Recommended: 1200x800 px</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Options */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={previewImage || ''}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/article-image.jpg"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Article Details Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Article Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter article title"
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
                    <option value="Treatment">Treatment</option>
                    <option value="Product">Product</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                    <option value="Tips">Tips & Advice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Article Content</label>
                <textarea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  rows="8"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Write your article content here..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author || 'Admin'}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
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
                {isAdding ? 'Publish Article' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-6">No articles match the selected category.</p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700"
          >
            Create Your First Article
          </button>
        </div>
      )}
    </div>
  );
};

export default Information;