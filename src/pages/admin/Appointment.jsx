import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointment = () => {
  // API URLs
  const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
  const MEMBERS_API_URL = 'http://localhost:5000/api/members';
  const THERAPISTS_API_URL = 'http://localhost:5000/api/therapists';
  const TREATMENTS_API_URL = 'http://localhost:5000/api/treatments';

  // State
  const [appointments, setAppointments] = useState([]);
  const [members, setMembers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_id: '',
    treatment: '',
    therapist: '',
    date: '',
    time: '',
    amount: 0,
    status: 'pending',
    notes: ''
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [amountInput, setAmountInput] = useState('');
  const [loading, setLoading] = useState({
    appointments: true,
    members: true,
    therapists: true,
    treatments: true
  });
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading({
        appointments: true,
        members: true,
        therapists: true,
        treatments: true
      });

      const [appointmentsRes, membersRes, therapistsRes, treatmentsRes] = await Promise.all([
        axios.get(APPOINTMENTS_API_URL),
        axios.get(MEMBERS_API_URL),
        axios.get(THERAPISTS_API_URL),
        axios.get(TREATMENTS_API_URL)
      ]);

      // Normalize data - pastikan semua appointment memiliki status
      const normalizedAppointments = appointmentsRes.data.map(app => ({
        ...app,
        status: app.status || 'pending' // Default ke 'pending' jika status null/undefined
      }));

      setAppointments(normalizedAppointments);
      setMembers(membersRes.data);
      setTherapists(therapistsRes.data);
      setTreatments(treatmentsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading({
        appointments: false,
        members: false,
        therapists: false,
        treatments: false
      });
    }
  };

  // Format currency
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Parse currency
  const parseRupiah = (currencyString) => {
    if (!currencyString) return 0;
    const numericString = currencyString.toString().replace(/[^\d]/g, '');
    return parseInt(numericString) || 0;
  };

  // Filter appointments - menggunakan useMemo untuk optimasi
  const filteredAppointments = React.useMemo(() => {
    if (selectedStatus === 'all') {
      return appointments;
    }
    return appointments.filter(app => app.status === selectedStatus);
  }, [appointments, selectedStatus]);

  // Get status color
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    switch(normalizedStatus) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle add appointment
  const handleAdd = () => {
    setIsAdding(true);
    const now = new Date();
    const today = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeNow = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    setFormData({
      customer_name: '',
      customer_id: '',
      treatment: '',
      therapist: '',
      date: today,
      time: timeNow,
      amount: 0,
      status: 'pending',
      notes: ''
    });
    setAmountInput('0');
  };

  // Handle edit appointment
  const handleEdit = (appointment) => {
    setEditingAppointment(appointment.id);
    setIsAdding(false);
    
    // Normalize appointment data before setting form
    const normalizedAppointment = {
      customer_name: appointment.customer_name || '',
      customer_id: appointment.customer_id || '',
      treatment: appointment.treatment || '',
      therapist: appointment.therapist || '',
      date: appointment.date || '',
      time: appointment.time || '',
      amount: parseFloat(appointment.amount) || 0,
      status: appointment.status || 'pending',
      notes: appointment.notes || ''
    };
    
    setFormData(normalizedAppointment);
    setAmountInput(normalizedAppointment.amount?.toString() || '0');
  };

  // Handle save appointment
  const handleSave = async () => {
    // Validation
    if (!formData.customer_name.trim()) {
      alert('Customer name is required');
      return;
    }
    
    if (!formData.treatment.trim()) {
      alert('Treatment is required');
      return;
    }
    
    if (!formData.therapist.trim()) {
      alert('Therapist is required');
      return;
    }

    setSaveLoading(true);

    try {
      // Normalize form data before sending
      const dataToSend = {
        ...formData,
        status: formData.status || 'pending'
      };

      if (isAdding) {
        // POST new appointment
        const response = await axios.post(APPOINTMENTS_API_URL, dataToSend);
        setAppointments(prev => [response.data, ...prev]);
        setIsAdding(false);
      } else {
        // PUT update appointment
        const response = await axios.put(`${APPOINTMENTS_API_URL}/${editingAppointment}`, dataToSend);
        setAppointments(prev => prev.map(app => 
          app.id === editingAppointment ? response.data : app
        ));
      }
      
      handleCancel();
    } catch (err) {
      console.error('Error saving appointment:', err);
      alert(err.response?.data?.error || 'Failed to save appointment');
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingAppointment(null);
    setIsAdding(false);
    setFormData({
      customer_name: '',
      customer_id: '',
      treatment: '',
      therapist: '',
      date: '',
      time: '',
      amount: 0,
      status: 'pending',
      notes: ''
    });
    setAmountInput('');
  };

  // Handle change form
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const numericValue = parseFloat(value) || 0;
      setFormData({ ...formData, [name]: numericValue });
      setAmountInput(value);
    } else if (name === 'customer_id') {
      const selectedMember = members.find(m => m.id == value);
      setFormData({ 
        ...formData, 
        [name]: value,
        customer_name: selectedMember ? selectedMember.name : formData.customer_name
      });
    } else if (name === 'treatment') {
      // Auto-set amount berdasarkan treatment yang dipilih
      const selectedTreatment = treatments.find(t => t.name === value);
      if (selectedTreatment) {
        setFormData({ 
          ...formData, 
          [name]: value,
          amount: selectedTreatment.price || 0
        });
        setAmountInput(selectedTreatment.price?.toString() || '0');
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle confirm appointment
  const handleConfirm = async (appointmentId) => {
    setActionLoading(prev => ({ ...prev, [appointmentId]: true }));
    
    try {
      const response = await axios.patch(`${APPOINTMENTS_API_URL}/${appointmentId}/status`, {
        status: 'confirmed'
      });
      
      // Pastikan data sudah dinormalisasi
      const updatedAppointment = {
        ...response.data,
        status: response.data.status || 'confirmed'
      };
      
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? updatedAppointment : app
      ));
      
    } catch (err) {
      console.error('Error confirming appointment:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to confirm appointment';
      alert(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Handle complete appointment
  const handleComplete = async (appointmentId) => {
    setActionLoading(prev => ({ ...prev, [appointmentId]: true }));
    
    try {
      const response = await axios.patch(`${APPOINTMENTS_API_URL}/${appointmentId}/status`, {
        status: 'completed'
      });
      
      // Pastikan data sudah dinormalisasi
      const updatedAppointment = {
        ...response.data,
        status: response.data.status || 'completed'
      };
      
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? updatedAppointment : app
      ));
      
      // Optionally update therapist and member data
      if (updatedAppointment && updatedAppointment.therapist) {
        await updateTherapistTreatmentCount(updatedAppointment.therapist);
      }
      
      if (updatedAppointment && updatedAppointment.customer_id) {
        await updateMemberLastVisit(updatedAppointment.customer_id, updatedAppointment.date);
      }
      
    } catch (err) {
      console.error('Error completing appointment:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to complete appointment';
      alert(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Update therapist treatment count
  const updateTherapistTreatmentCount = async (therapistName) => {
    try {
      const therapist = therapists.find(t => t.name === therapistName);
      if (therapist) {
        const currentCount = therapist.total_treatments || 0;
        await axios.put(`${THERAPISTS_API_URL}/${therapist.id}`, {
          total_treatments: currentCount + 1
        });
        
        const response = await axios.get(THERAPISTS_API_URL);
        setTherapists(response.data);
      }
    } catch (err) {
      console.error('Error updating therapist count:', err);
    }
  };

  // Update member last visit
  const updateMemberLastVisit = async (memberId, visitDate) => {
    try {
      const member = members.find(m => m.id == memberId);
      if (member) {
        const currentVisits = member.total_visits || 0;
        await axios.put(`${MEMBERS_API_URL}/${memberId}`, {
          last_visit: visitDate,
          total_visits: currentVisits + 1
        });
        
        const response = await axios.get(MEMBERS_API_URL);
        setMembers(response.data);
      }
    } catch (err) {
      console.error('Error updating member visit:', err);
    }
  };

  // Handle delete appointment
  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await axios.delete(`${APPOINTMENTS_API_URL}/${appointmentId}`);
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert(err.response?.data?.error || 'Failed to delete appointment');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr, timeStr) => {
    try {
      return `${dateStr}, ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Loading state
  const isLoading = Object.values(loading).some(l => l === true);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments data...</p>
        </div>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAllData}
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

      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600">Manage, confirm, and complete appointment treatments.</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Appointment
        </button>
      </div>

      {/* Status Legend and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">Pending</span>
                <div className="text-xs text-gray-500">Waiting for confirmation</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">Confirmed</span>
                <div className="text-xs text-gray-500">Appointment approved</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">Completed</span>
                <div className="text-xs text-gray-500">Treatment finished</div>
              </div>
            </div>
          </div>
          
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Appointment List</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </span>
        </div>
        
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Treatment</th>
                  <th className="pb-3 font-medium">Therapist</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3">
                      <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {appointment.appointment_id || `APT${appointment.id}`}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-gray-800">{appointment.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {appointment.customer_id ? `ID: ${appointment.customer_id}` : 'Walk-in Customer'}
                      </div>
                      {appointment.notes && (
                        <div className="text-xs text-gray-400 mt-1">{appointment.notes}</div>
                      )}
                    </td>
                    <td className="py-3 text-sm text-gray-800">{appointment.treatment}</td>
                    <td className="py-3 text-sm text-brown-600">{appointment.therapist}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {formatDisplayDate(appointment.date, appointment.time)}
                    </td>
                    <td className="py-3 text-sm font-medium text-green-600">
                      {formatRupiah(appointment.amount)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(appointment.id)}
                            disabled={actionLoading[appointment.id]}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 flex items-center"
                          >
                            {actionLoading[appointment.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Confirming...
                              </>
                            ) : (
                              'Confirm'
                            )}
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleComplete(appointment.id)}
                            disabled={actionLoading[appointment.id]}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 flex items-center"
                          >
                            {actionLoading[appointment.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Completing...
                              </>
                            ) : (
                              'Complete'
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(appointment)}
                          disabled={actionLoading[appointment.id]}
                          className="px-3 py-1 bg-brown-500 text-white text-xs rounded hover:bg-brown-600 transition-colors duration-200 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          disabled={deleteLoading}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filter criteria.</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              Add New Appointment
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(editingAppointment || isAdding) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isAdding ? 'Add New Appointment' : 'Edit Appointment'}
            </h3>
            
            <div className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member
                </label>
                <select
                  name="customer_id"
                  value={formData.customer_id || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="">Select a member</option>
                  <option value="0">Walk-in Customer</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.id} - {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Treatment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Treatment <span className="text-red-500">*</span>
                </label>
                <select
                  name="treatment"
                  value={formData.treatment || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a treatment</option>
                  {treatments.map(treatment => (
                    <option key={treatment.id} value={treatment.name}>
                      {treatment.name} - {formatRupiah(treatment.price)} ({treatment.duration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Therapist Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Therapist <span className="text-red-500">*</span>
                </label>
                <select
                  name="therapist"
                  value={formData.therapist || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a therapist</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.name}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="15 Jan 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="14:30"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={amountInput}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Display: {formatRupiah(formData.amount)}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || 'pending'}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
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
                  'Add Appointment'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;