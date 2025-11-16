import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const user = localStorage.getItem('upm_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Add user data to headers for backend authentication
        config.headers['X-User-Data'] = JSON.stringify(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Network error
      throw new Error('Network error - please check your connection');
    } else {
      // Other error
      throw new Error('An unexpected error occurred');
    }
  }
);

// API functions

// Authentication
export const authAPI = {
  login: async (username, password) => {
    console.log('[authAPI] Login called for username:', username);
    console.log('[authAPI] Sending POST to /auth/login');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('[authAPI] Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[authAPI] Login request failed:', error);
      throw error;
    }
  },

  logout: async () => {
    console.log('[authAPI] Logout called');
    const response = await api.post('/auth/logout');
    return response.data;
  }
};


// Patient management
export const patientAPI = {
  search: async (query) => {
    const response = await api.get('/patients/search', { params: { query } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  getOwnData: async () => {
    const response = await api.get('/patients/me');
    return response.data;
  }
};

// Vital signs management
export const vitalAPI = {
  update: async (patientId, vitalData) => {
    const response = await api.post(`/patients/${patientId}/vitals`, vitalData);
    return response.data;
  }
};

// Billing management
export const billingAPI = {
  getUnbilledVisits: async () => {
    const response = await api.get('/visits/unbilled');
    return response.data;
  },

  generateBilling: async (visitIds) => {
    const response = await api.post('/billing/generate', { visitIds });
    return response.data;
  }
};

// Audit log management
export const auditAPI = {
  getLogs: async (filters = {}) => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.userType) params.userType = filters.userType;
    if (filters.actionType) params.actionType = filters.actionType;

    const response = await api.get('/audit/logs', { params });
    return response.data;
  }
};

export default api;
