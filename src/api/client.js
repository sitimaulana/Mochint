// src/api/client.js

// GANTI INI:
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const DEBUG_MODE = process.env.NODE_ENV === 'development';

// MENJADI INI:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEBUG_MODE = import.meta.env.MODE === 'development';

// ============================
// CONFIGURATION
// ============================

// Enhanced logging
const log = (...args) => {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`🔧 [${timestamp}] API:`, ...args);
  }
};

const logError = (...args) => {
  const timestamp = new Date().toISOString();
  console.error(`❌ [${timestamp}] API Error:`, ...args);
};

const logWarn = (...args) => {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.warn(`⚠️ [${timestamp}] API Warning:`, ...args);
  }
};

// ============================
// HELPER FUNCTIONS
// ============================

// Get headers with authentication
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    log('Token found in headers');
  } else {
    log('No token found in localStorage');
  }
  
  return headers;
};

// Safe JSON parsing
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return str ? JSON.parse(str) : defaultValue;
  } catch (error) {
    logError('JSON parse error:', error);
    return defaultValue;
  }
};

// Enhanced fetch with timeout and retry
const enhancedFetch = async (url, options = {}, retries = 2, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      logError(`Request timeout for ${url}`);
      throw new Error('Request timeout. Please check your connection.');
    }
    
    // Retry logic
    if (retries > 0) {
      logWarn(`Retrying request to ${url} (${retries} retries left)`);
      return enhancedFetch(url, options, retries - 1, timeout);
    }
    
    throw error;
  }
};

// Response handler
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    logError('Non-JSON response:', text.substring(0, 200));
    throw new Error('Server returned non-JSON response');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    logError('API error response:', {
      status: response.status,
      error: errorMessage,
      url: response.url
    });
    throw new Error(errorMessage);
  }
  
  return data;
};

// ============================
// AUTHENTICATION API
// ============================

const authAPI = {
  // Login - Dual System
  login: async (email, password) => {
    try {
      log('🔐 Login attempt for:', email);
      
      const response = await enhancedFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const data = await handleResponse(response);
      log('✅ Login response:', { 
        success: data.success,
        user_type: data.user?.user_type 
      });
      
      // Save to localStorage
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_type', data.user.user_type || 'member');
        localStorage.setItem('login_time', new Date().toISOString());
        log('✅ Auth data saved to localStorage');
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message || 'Login successful'
      };
      
    } catch (error) {
      logError('❌ Login error:', error);
      
      // User-friendly error messages
      const errorMessage = error.message.toLowerCase();
      let userFriendlyError = 'Login failed';
      
      if (errorMessage.includes('password salah')) {
        userFriendlyError = 'Password salah';
      } else if (errorMessage.includes('email tidak terdaftar')) {
        userFriendlyError = 'Email tidak terdaftar';
      } else if (errorMessage.includes('tidak aktif')) {
        userFriendlyError = 'Akun tidak aktif';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Koneksi timeout. Periksa jaringan Anda.';
      } else if (errorMessage.includes('network')) {
        userFriendlyError = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }
      
      throw new Error(userFriendlyError);
    }
  },
  
  // Register
  register: async (userData) => {
    try {
      log('📝 Register attempt for:', userData.email);
      
      const response = await enhancedFetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      const data = await handleResponse(response);
      log('✅ Register successful:', { id: data.user?.id });
      
      // Save to localStorage
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_type', data.user.user_type || 'member');
        localStorage.setItem('login_time', new Date().toISOString());
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message || 'Registration successful'
      };
      
    } catch (error) {
      logError('❌ Register error:', error);
      
      let userFriendlyError = error.message;
      if (error.message.includes('already registered')) {
        userFriendlyError = 'Email sudah terdaftar';
      } else if (error.message.includes('Password must be')) {
        userFriendlyError = 'Password minimal 6 karakter';
      }
      
      throw new Error(userFriendlyError);
    }
  },
  
  // Logout
  logout: () => {
    log('👋 Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
    localStorage.removeItem('login_time');
    localStorage.removeItem('active_user');
    localStorage.removeItem('isAdmin');
    log('✅ LocalStorage cleared');
  },
  
  // Verify token
  verify: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        log('No token found for verification');
        return { valid: false, reason: 'No token' };
      }
      
      const response = await enhancedFetch(`${API_URL}/auth/verify`);
      const data = await response.json();
      
      if (response.ok) {
        log('✅ Token verified successfully');
        return { valid: true, user: data.user };
      } else {
        logWarn('Token verification failed:', data.error);
        return { valid: false, reason: data.error };
      }
      
    } catch (error) {
      logError('Token verification error:', error);
      return { valid: false, reason: error.message };
    }
  },
  
  // Reset passwords (development only)
  resetPasswords: async () => {
    if (import.meta.env.MODE === 'production') {
      throw new Error('This feature is only available in development');
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-passwords`);
      return await handleResponse(response);
    } catch (error) {
      logError('Reset passwords error:', error);
      throw error;
    }
  }
};

// ============================
// ADMIN API
// ============================

const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      log('📊 Fetching admin dashboard stats');
      const response = await enhancedFetch(`${API_URL}/admin/dashboard`);
      const data = await handleResponse(response);
      log('✅ Dashboard stats fetched');
      return data;
    } catch (error) {
      logError('Get dashboard stats error:', error);
      throw error;
    }
  },
  
  // Get admin profile
  getProfile: async () => {
    try {
      const response = await enhancedFetch(`${API_URL}/admin/profile`);
      return await handleResponse(response);
    } catch (error) {
      logError('Get admin profile error:', error);
      throw error;
    }
  }
};

// ============================
// PUBLIC DATA API
// ============================

const publicAPI = {
  // Get all treatments
  getTreatments: async () => {
    try {
      log('Fetching treatments');
      const response = await enhancedFetch(`${API_URL}/treatments`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} treatments`);
      return data.data || [];
    } catch (error) {
      logError('Get treatments error:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
  // Get all products
  getProducts: async () => {
    try {
      log('Fetching products');
      const response = await enhancedFetch(`${API_URL}/products`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} products`);
      return data.data || [];
    } catch (error) {
      logError('Get products error:', error);
      return [];
    }
  },
  
  // Get all articles
  getArticles: async () => {
    try {
      log('Fetching articles');
      const response = await enhancedFetch(`${API_URL}/articles`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} articles`);
      return data.data || [];
    } catch (error) {
      logError('Get articles error:', error);
      return [];
    }
  },
  
  // Get all therapists
  getTherapists: async () => {
    try {
      log('Fetching therapists');
      const response = await enhancedFetch(`${API_URL}/therapists`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} therapists`);
      return data.data || [];
    } catch (error) {
      logError('Get therapists error:', error);
      return [];
    }
  }
};

// ============================
// MEMBERS API
// ============================

const membersAPI = {
  // Get all members
  getAll: async () => {
    try {
      log('Fetching members');
      const response = await enhancedFetch(`${API_URL}/members`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} members`);
      return data.data || [];
    } catch (error) {
      logError('Get members error:', error);
      throw error;
    }
  },
  
  // Get member by ID
  getById: async (id) => {
    try {
      log(`Fetching member ${id}`);
      const response = await enhancedFetch(`${API_URL}/members/${id}`);
      const data = await handleResponse(response);
      log(`✅ Fetched member ${id}`);
      return data.data;
    } catch (error) {
      logError(`Get member ${id} error:`, error);
      throw error;
    }
  },
  
  // Update member
  update: async (id, memberData) => {
    try {
      log(`Updating member ${id}:`, memberData);
      const response = await enhancedFetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
      });
      const data = await handleResponse(response);
      log(`✅ Updated member ${id}`);
      return data;
    } catch (error) {
      logError(`Update member ${id} error:`, error);
      throw error;
    }
  }
};

// ============================
// APPOINTMENTS API
// ============================

const appointmentsAPI = {
  // Get all appointments
  getAll: async () => {
    try {
      log('Fetching appointments');
      const response = await enhancedFetch(`${API_URL}/appointments`);
      const data = await handleResponse(response);
      log(`✅ Fetched ${data.data?.length || 0} appointments`);
      return data.data || [];
    } catch (error) {
      logError('Get appointments error:', error);
      throw error;
    }
  },
  
  // Create appointment
  create: async (appointmentData) => {
    try {
      log('Creating appointment:', appointmentData);
      const response = await enhancedFetch(`${API_URL}/appointments`, {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
      const data = await handleResponse(response);
      log('✅ Appointment created:', data.data?.id);
      return data;
    } catch (error) {
      logError('Create appointment error:', error);
      throw error;
    }
  }
};

// ============================
// REVIEWS API
// ============================

const reviewsAPI = {
  // Create review
  create: async (reviewData) => {
    try {
      log('📝 Creating review:', reviewData);
      
      // Simpan ke localStorage untuk sementara
      const existingReviews = safeJsonParse(localStorage.getItem('public_reviews'), []);
      const savedReview = {
        id: Date.now(),
        ...reviewData,
        location: reviewData.location || 'Verified Member', 
        date: new Date().toLocaleDateString('id-ID'),
        timestamp: new Date().toISOString(),
        rating: reviewData.rating || 5
      };
      
      const updatedReviews = [savedReview, ...existingReviews];
      localStorage.setItem('public_reviews', JSON.stringify(updatedReviews));
      
      log('✅ Review saved to localStorage');
      
      return {
        success: true,
        data: savedReview,
        message: 'Review submitted successfully'
      };
      
    } catch (error) {
      logError('❌ Create review error:', error);
      throw new Error('Failed to create review: ' + error.message);
    }
  },
  
  // Get all reviews
  getAll: async () => {
    try {
      log('Fetching all reviews');
      const reviews = safeJsonParse(localStorage.getItem('public_reviews'), []);
      log(`✅ Found ${reviews.length} reviews`);
      return reviews;
    } catch (error) {
      logError('Get all reviews error:', error);
      return [];
    }
  },
  
  // Get public reviews (for homepage/dashboard)
  getPublic: async () => {
    try {
      log('Fetching public reviews');
      const allReviews = safeJsonParse(localStorage.getItem('public_reviews'), []);
      const publicReviews = allReviews.slice(0, 5);
      log(`✅ Found ${publicReviews.length} public reviews`);
      return publicReviews;
    } catch (error) {
      logError('Get public reviews error:', error);
      return [];
    }
  },
  
  // Get recent reviews
  getRecent: async (limit = 3) => {
    try {
      log(`Fetching recent reviews (limit: ${limit})`);
      const allReviews = safeJsonParse(localStorage.getItem('public_reviews'), []);
      const recentReviews = allReviews.slice(0, limit);
      log(`✅ Found ${recentReviews.length} recent reviews`);
      return recentReviews;
    } catch (error) {
      logError('Get recent reviews error:', error);
      return [];
    }
  }
};

// ============================
// DASHBOARD API
// ============================

const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      log('📊 Fetching dashboard stats');
      
      // Jika admin, gunakan adminAPI
      if (getUserType() === 'admin') {
        const stats = await adminAPI.getDashboardStats();
        return stats;
      }
      
      // Jika member, hitung stats sederhana
      const user = getCurrentUser();
      if (!user) throw new Error('User not logged in');
      
      // Dummy data untuk member dashboard
      const memberStats = {
        total_appointments: 0,
        pending_appointments: 0,
        completed_appointments: 0,
        recent_activity: [],
        upcoming_appointments: []
      };
      
      try {
        const appointments = await appointmentsAPI.getAll();
        memberStats.total_appointments = appointments.length;
        memberStats.pending_appointments = appointments.filter(a => a.status === 'pending').length;
        memberStats.completed_appointments = appointments.filter(a => a.status === 'completed').length;
        memberStats.recent_activity = appointments.slice(0, 5);
        
        // Upcoming appointments (today or future)
        const today = new Date().toISOString().split('T')[0];
        memberStats.upcoming_appointments = appointments.filter(a => a.date >= today).slice(0, 3);
      } catch (error) {
        logWarn('Could not fetch appointments for dashboard:', error);
      }
      
      return {
        success: true,
        data: memberStats,
        message: 'Dashboard stats retrieved'
      };
      
    } catch (error) {
      logError('Get dashboard stats error:', error);
      throw error;
    }
  }
};

// ============================
// AUTH HELPER FUNCTIONS
// ============================

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const result = !!(token && user);
  
  if (DEBUG_MODE) {
    log('isAuthenticated check:', { 
      token: !!token, 
      user: !!user, 
      result 
    });
  }
  
  return result;
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  const user = safeJsonParse(userStr);
  
  if (DEBUG_MODE && user) {
    log('getCurrentUser:', { 
      id: user.id,
      name: user.name,
      email: user.email,
      user_type: user.user_type 
    });
  }
  
  return user;
};

// Get user type
const getUserType = () => {
  return localStorage.getItem('user_type') || 'member';
};

// Check if user is admin
const isAdmin = () => {
  const userType = getUserType();
  const user = getCurrentUser();
  const result = userType === 'admin' && user?.is_admin === true;
  
  if (DEBUG_MODE) {
    log('isAdmin check:', { 
      user_type: userType, 
      is_admin: user?.is_admin, 
      result 
    });
  }
  
  return result;
};

// Check if user is member
const isMember = () => {
  const userType = getUserType();
  const result = userType === 'member';
  
  if (DEBUG_MODE) {
    log('isMember check:', { 
      user_type: userType, 
      result 
    });
  }
  
  return result;
};

// Clear all auth data
const clearAuthData = () => {
  log('Clearing all auth data');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_type');
  localStorage.removeItem('login_time');
  localStorage.removeItem('active_user');
  localStorage.removeItem('isAdmin');
};

// Check token expiration
const checkTokenExpiration = () => {
  const loginTime = localStorage.getItem('login_time');
  if (!loginTime) return true;
  
  const loginDate = new Date(loginTime);
  const now = new Date();
  const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
  
  // Token expires after 7 days (as set in server)
  if (hoursDiff > 168) { // 7 days = 168 hours
    log('🕒 Token expired (more than 7 days)');
    return true;
  }
  
  return false;
};

// Auto-check token expiration
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (isAuthenticated()) {
      const isExpired = checkTokenExpiration();
      if (isExpired) {
        log('🔄 Token expired, clearing auth data');
        clearAuthData();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
  });
}

// ============================
// HOME DATA API
// ============================

const fetchHomeData = async () => {
  try {
    log('Fetching home data');
    
    const [products, treatments, therapists, articles] = await Promise.allSettled([
      publicAPI.getProducts(),
      publicAPI.getTreatments(),
      publicAPI.getTherapists(),
      publicAPI.getArticles()
    ]);
    
    const result = {
      products: products.status === 'fulfilled' ? products.value.slice(0, 4) : [],
      treatments: treatments.status === 'fulfilled' ? treatments.value.slice(0, 6) : [],
      therapists: therapists.status === 'fulfilled' ? therapists.value.slice(0, 4) : [],
      articles: articles.status === 'fulfilled' ? articles.value.slice(0, 3) : []
    };
    
    log('✅ Home data fetched:', {
      products: result.products.length,
      treatments: result.treatments.length,
      therapists: result.therapists.length,
      articles: result.articles.length
    });
    
    return result;
  } catch (error) {
    logError('Error fetching home data:', error);
    return {
      products: [],
      treatments: [],
      therapists: [],
      articles: []
    };
  }
};

// ============================
// API TESTING UTILITIES
// ============================

// Test API connection
const testAPIConnection = async () => {
  try {
    log('Testing API connection...');
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "API connection failed");
    }
    
    log('✅ API connection test successful:', {
      version: data.version,
      database: data.database
    });
    
    return {
      success: true,
      data: data
    };
    
  } catch (error) {
    logError('❌ API connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    log('Testing database connection via API...');
    const result = await testAPIConnection();
    
    if (result.success) {
      return {
        success: true,
        message: 'Database connection is OK',
        data: result.data.database
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    logError('Database connection test error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================
// CREATE API OBJECT
// ============================

const api = {
  auth: authAPI,
  admin: adminAPI,
  public: publicAPI,
  members: membersAPI,
  appointments: appointmentsAPI,
  reviews: reviewsAPI,
  dashboard: dashboardAPI,
  
  // Helper functions
  isAuthenticated,
  getCurrentUser,
  getUserType,
  isAdmin,
  isMember,
  clearAuthData,
  checkTokenExpiration,
  
  // Utilities
  testAPIConnection,
  testDatabaseConnection,
  fetchHomeData
};

// ============================
// EXPORT BOTH DEFAULT AND NAMED
// ============================

export default api;

// Named exports untuk backward compatibility
export {
  authAPI,
  adminAPI,
  publicAPI,
  membersAPI,
  appointmentsAPI,
  reviewsAPI,
  dashboardAPI,
  isAuthenticated,
  getCurrentUser,
  getUserType,
  isAdmin,
  isMember,
  clearAuthData,
  checkTokenExpiration,
  testAPIConnection,
  testDatabaseConnection,
  fetchHomeData
};