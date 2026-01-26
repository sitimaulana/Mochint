// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // GUNAKAN HARDCODE DULU
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

export default api;