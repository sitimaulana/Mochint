// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // GUNAKAN HARDCODE DULU
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. User has a token (meaning they are logged in)
    // 2. Token is invalid (403/401 error)
    // 3. NOT from public pages
    const token = localStorage.getItem('token');
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isProtectedEndpoint = error.config?.url?.includes('/members') || 
                                  error.config?.url?.includes('/appointments');
    
    if (token && isAuthError && isProtectedEndpoint) {
      console.error('Unauthorized access - token invalid or expired');
      // Clear invalid token and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Member API endpoints
export const memberAPI = {
  getAll: () => api.get('/members'),
  create: (memberData) => api.post('/members', memberData),
  update: (id, memberData) => api.put(`/members/${id}`, memberData),
  delete: (id) => api.delete(`/members/${id}`),
};

export const therapistAPI = {
  getAll: () => api.get('/therapists'),
  getById: (id) => api.get(`/therapists/${id}`),
  create: (therapistData) => api.post('/therapists', therapistData),
  update: (id, therapistData) => api.put(`/therapists/${id}`, therapistData),
  delete: (id) => api.delete(`/therapists/${id}`),
  search: (query) => api.get(`/therapists/search?q=${query}`),
  getStats: () => api.get('/therapists/stats'),
  getTop: (limit = 5) => api.get(`/therapists/top?limit=${limit}`),
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByMember: (memberId) => api.get(`/appointments/member/${memberId}`),
  getByStatus: (status) => api.get(`/appointments/status/${status}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  complete: (id) => api.put(`/appointments/${id}/complete`),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const treatmentAPI = {
  getAll: () => api.get('/treatments'),
  getById: (id) => api.get(`/treatments/${id}`),
  getByCategory: (category) => api.get(`/treatments/category/${category}`),
  getCategories: () => api.get('/treatments/categories'),
  getPopular: (limit = 5) => api.get(`/treatments/popular?limit=${limit}`),
  getStats: () => api.get('/treatments/stats'),
  getWithStats: () => api.get('/treatments/with-stats'),
  search: (query) => api.get(`/treatments/search?q=${query}`),
  create: (treatmentData) => api.post('/treatments', treatmentData),
  update: (id, treatmentData) => api.put(`/treatments/${id}`, treatmentData),
  delete: (id) => api.delete(`/treatments/${id}`),
};

export default api;
