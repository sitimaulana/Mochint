import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Therapist = () => {
  const [therapists, setTherapists] = useState([]);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experienceYears: 0,
    status: 'active',
    workingHours: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingDetails, setViewingDetails] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // API base URL
  const API_URL = 'http://localhost:5000/api/therapists';
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';

  // Fetch therapists dari API
  useEffect(() => {
    fetchTherapists();
    fetchAppointments();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTherapists(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch therapists. Please try again.');
      console.error('Error fetching therapists:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const response = await axios.get(APPOINTMENTS_API_URL);
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: therapists.length,
    active: therapists.filter(t => t.status === 'active').length,
    totalTreatments: therapists.reduce((sum, therapist) => sum + (parseInt(therapist.total_treatments || therapist.totalTreatments) || 0), 0),
    newThisMonth: therapists.filter(t => {
      const joinDate = t.join_date || t.joinDate;
      if (!joinDate) return false;
      const joinMonth = new Date(joinDate).getMonth();
      const currentMonth = new Date().getMonth();
      return joinMonth === currentMonth;
    }).length
  };

  // Filter therapists
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch =
      (therapist.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (therapist.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (therapist.phone || '').includes(searchTerm) ||
      (therapist.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (therapist.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || therapist.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Get appointments by therapist
  const getAppointmentsByTherapist = (therapistName) => {
    return appointments.filter(app =>
      app.therapist === therapistName && app.status === 'completed'
    );
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experienceYears: 0,
      status: 'active',
      workingHours: ''
    });
  };

  const handleEdit = (therapist) => {
    setEditingTherapist(therapist._id || therapist.id);
    setIsAdding(false);
    setFormData({
      id: therapist.id || therapist._id,
      name: therapist.name || '',
      email: therapist.email || '',
      phone: therapist.phone || '',
      specialization: therapist.specialization || '',
      experienceYears: therapist.experience_years || 0,
      status: therapist.status || 'active',
      workingHours: therapist.working_hours || ''
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }

    if (!formData.email?.trim()) {
      alert('Email is required');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSaveLoading(true);

    try {
      if (isAdding) {
        // Generate ID untuk therapist baru
        const newId = `TH${String(therapists.length + 1).padStart(3, '0')}`;

        const newTherapistData = {
          id: newId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone || '',
          specialization: formData.specialization || '',
          experience_years: parseInt(formData.experienceYears) || 0,
          status: formData.status || 'active',
          working_hours: formData.workingHours || ''
        };

        const response = await axios.post(API_URL, newTherapistData);
        setTherapists([response.data, ...therapists]);
        setIsAdding(false);
      } else {
        const updatedTherapistData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone || '',
          specialization: formData.specialization || '',
          experience_years: parseInt(formData.experienceYears) || 0,
          status: formData.status || 'active',
          working_hours: formData.workingHours || ''
        };

        const response = await axios.put(`${API_URL}/${editingTherapist}`, updatedTherapistData);
        setTherapists(therapists.map(therapist =>
          (therapist._id || therapist.id) === editingTherapist ? response.data : therapist
        ));
      }

      handleCancel();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save therapist');
      console.error('Error saving therapist:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingTherapist(null);
    setIsAdding(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experienceYears: 0,
      status: 'active',
      workingHours: ''
    });
  };

  const handleDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/${showDeleteConfirm}`);
      setTherapists(therapists.filter(therapist => (therapist._id || therapist.id) !== showDeleteConfirm));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete therapist');
      console.error('Error deleting therapist:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleView = (therapist) => {
    setViewingDetails(therapist);
  };

  // Loading state
  if (loading && therapists.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading therapists...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && therapists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Therapists</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTherapists}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Page Title and Stats */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Therapists Management</h1>
            <p className="text-gray-600">Manage therapist profiles and treatment history.</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Loading...' : 'Add Therapist'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Therapists</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTreatments}</div>
            <div className="text-sm text-gray-600">Total Treatments</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.newThisMonth}</div>
            <div className="text-sm text-gray-600">New This Month</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search therapists by name, email, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Therapists Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Therapist List</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredTherapists.length} of {therapists.length} therapists
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading therapists...</p>
          </div>
        ) : filteredTherapists.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Therapist</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Treatments</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Join Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.map((therapist) => {
                  const therapistAppointments = getAppointmentsByTherapist(therapist.name);

                  return (
                    <tr key={therapist.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-3">
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {therapist.id || therapist._id}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{therapist.image || '👨‍⚕️'}</div>
                          <div>
                            <div className="font-medium text-gray-800">{therapist.name || 'N/A'}</div>
                            {therapist.notes && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {therapist.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm text-gray-600">{therapist.email || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{therapist.phone || 'N/A'}</div>
                      </td>
                      <td className="py-3">
                        <div className="text-lg font-bold text-gray-800">
                          {therapist.total_treatments || therapist.totalTreatments || 0}
                        </div>
                        <div className="text-xs text-gray-400">completed treatments</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${therapist.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {therapist.status || 'inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {therapist.join_date || therapist.joinDate || 'N/A'}
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(therapist)}
                            className="px-3 py-1 bg-brown-500 text-white text-xs rounded hover:bg-brown-600 transition-colors duration-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(therapist)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(therapist._id || therapist.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              Add New Therapist
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(editingTherapist || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isAdding ? 'Add New Therapist' : 'Edit Therapist'}
            </h3>

            <div className="space-y-4">
              {/* Therapist ID Field - Visible only when editing */}
              {!isAdding && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Therapist ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="doctor@clinic.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Skin Care, Facial Treatment, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears || 0}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="09:00 - 17:00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : isAdding ? (
                  'Add Therapist'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Therapist</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this therapist?
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Therapist'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{viewingDetails.name}</h3>
                <p className="text-sm text-gray-600">ID: {viewingDetails.id || viewingDetails._id}</p>
              </div>
              <button
                onClick={() => setViewingDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Emoji Avatar</label>
                  <div className="text-4xl mt-2">{viewingDetails.image || '👨‍⚕️'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Information</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{viewingDetails.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{viewingDetails.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Join Date</label>
                  <div className="text-gray-600 mt-1">
                    {viewingDetails.join_date || viewingDetails.joinDate || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${viewingDetails.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {viewingDetails.status || 'inactive'}
                    </span>
                  </div>
                </div>

                {viewingDetails.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <div className="mt-1 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">{viewingDetails.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Statistics & Appointment History */}
              <div className="space-y-4">
                {/* Statistics */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Statistics</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {viewingDetails.total_treatments || viewingDetails.totalTreatments || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Treatments</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getAppointmentsByTherapist(viewingDetails.name).length}
                      </div>
                      <div className="text-sm text-gray-600">Completed Appointments</div>
                    </div>
                  </div>
                </div>

                {/* Appointment History */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Recent Treatments</label>
                  <div className="max-h-60 overflow-y-auto">
                    {appointmentsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brown-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading appointments...</p>
                      </div>
                    ) : getAppointmentsByTherapist(viewingDetails.name).length > 0 ? (
                      <div className="space-y-2">
                        {getAppointmentsByTherapist(viewingDetails.name)
                          .slice(0, 5)
                          .map((appointment, index) => (
                            <div key={appointment._id || index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-800">{appointment.customer || appointment.customerName}</div>
                                  <div className="text-sm text-gray-600">{appointment.treatment || appointment.treatmentName}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-brown-600">
                                    {appointment.amount || 'Rp 0'}
                                  </div>
                                  <div className="text-xs text-gray-500">{appointment.date || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No completed treatments yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingDetails(null)}
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

export default Therapist;