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
    // For demo purposes, we'll validate on the frontend first
    // In a real app, this would only be done on the server
    const validUsers = {
      'dr.smith': { password: 'physician123', role: 'physician', personID: 1, name: 'Dr. Smith' },
      'john.doe': { password: 'patient123', role: 'patient', personID: 2, name: 'John Doe' },
      'nurse.jane': { password: 'nurse123', role: 'nurse', personID: 3, name: 'Nurse Jane' },
      'admin': { password: 'admin123', role: 'admin', personID: 4, name: 'Admin User' }
    };

    const user = validUsers[username];
    if (user && user.password === password) {
      return {
        data: { user: { personID: user.personID, username, role: user.role, name: user.name } },
        success: true
      };
    } else {
      throw new Error('Invalid username or password');
    }
  },

  logout: async () => {
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
