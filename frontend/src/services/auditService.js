import api from './api';

/**
 * Audit service for API communication
 */
const auditService = {
  /**
   * Get audit logs with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.startDate - Start date (ISO string)
   * @param {string} filters.endDate - End date (ISO string)
   * @param {string} filters.userType - User role filter ('all', 'physician', 'patient', etc.)
   * @param {string} filters.actionType - Action type filter ('all', 'LOGIN', 'LOGIN_FAILED')
   * @param {number} filters.page - Page number (1-based)
   * @param {number} filters.limit - Items per page
   * @returns {Promise} API response with audit logs and pagination
   */
  getAuditLogs: async (filters = {}) => {
    try {
      const params = {};

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.userType && filters.userType !== 'all') params.userType = filters.userType;
      if (filters.actionType && filters.actionType !== 'all') params.actionType = filters.actionType;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const response = await api.get('/audit/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  /**
   * Get recent audit logs
   * @param {number} limit - Number of recent logs to fetch (default: 10)
   * @returns {Promise} API response with recent audit logs
   */
  getRecentLogs: async (limit = 10) => {
    try {
      const response = await api.get('/audit/logs/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent audit logs:', error);
      throw error;
    }
  },

  /**
   * Get audit statistics
   * @returns {Promise} API response with audit statistics
   */
  getAuditStats: async () => {
    try {
      const response = await api.get('/audit/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  },

  /**
   * Export audit logs
   * @param {Object} filters - Filter options for export
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {Promise} File download response
   */
  exportAuditLogs: async (filters = {}, format = 'json') => {
    try {
      const params = { format };

      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.userType && filters.userType !== 'all') params.userType = filters.userType;
      if (filters.actionType && filters.actionType !== 'all') params.actionType = filters.actionType;

      // This will trigger a file download
      const response = await api.get('/audit/export', {
        params,
        responseType: 'blob'
      });

      return response;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  },

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted date/time string
   */
  formatTimestamp: (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  },

  /**
   * Get action type display text
   * @param {string} actionType - Action type code
   * @returns {string} Human-readable action description
   */
  getActionTypeText: (actionType) => {
    const actionTexts = {
      'LOGIN': 'User Login',
      'LOGIN_FAILED': 'Failed Login Attempt',
      'LOGOUT': 'User Logout',
      'VIEW_PATIENT': 'Viewed Patient Record',
      'UPDATE_VITALS': 'Updated Patient Vitals',
      'GENERATE_BILLING': 'Generated Billing',
      'SUBMIT_BILLING': 'Submitted Billing to Insurance'
    };

    return actionTexts[actionType] || actionType.replace('_', ' ');
  },

  /**
   * Get user role display text
   * @param {string} role - User role
   * @returns {string} Human-readable role name
   */
  getRoleText: (role) => {
    const roleTexts = {
      'physician': 'Physician',
      'patient': 'Patient',
      'nurse': 'Nurse',
      'admin': 'Administrator'
    };

    return roleTexts[role] || role.charAt(0).toUpperCase() + role.slice(1);
  },

  /**
   * Get action type color for UI display
   * @param {string} actionType - Action type
   * @returns {string} CSS color value
   */
  getActionTypeColor: (actionType) => {
    const colors = {
      'LOGIN': '#27ae60',
      'LOGIN_FAILED': '#e74c3c',
      'LOGOUT': '#95a5a6',
      'VIEW_PATIENT': '#3498db',
      'UPDATE_VITALS': '#f39c12',
      'GENERATE_BILLING': '#9b59b6',
      'SUBMIT_BILLING': '#1abc9c'
    };

    return colors[actionType] || '#95a5a6';
  },

  /**
   * Filter options for user types
   * @returns {Array} Array of filter options
   */
  getUserTypeOptions: () => [
    { value: 'all', label: 'All Users' },
    { value: 'physician', label: 'Physicians' },
    { value: 'patient', label: 'Patients' },
    { value: 'nurse', label: 'Nurses' },
    { value: 'admin', label: 'Administrators' }
  ],

  /**
   * Filter options for action types
   * @returns {Array} Array of filter options
   */
  getActionTypeOptions: () => [
    { value: 'all', label: 'All Actions' },
    { value: 'LOGIN', label: 'User Logins' },
    { value: 'LOGIN_FAILED', label: 'Failed Logins' },
    { value: 'LOGOUT', label: 'User Logouts' },
    { value: 'VIEW_PATIENT', label: 'Patient Record Views' },
    { value: 'UPDATE_VITALS', label: 'Vital Updates' },
    { value: 'GENERATE_BILLING', label: 'Billing Generation' },
    { value: 'SUBMIT_BILLING', label: 'Billing Submissions' }
  ],

  /**
   * Validate filter parameters
   * @param {Object} filters - Filter object to validate
   * @returns {Object} Validation result
   */
  validateFilters: (filters) => {
    const errors = [];

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      if (start > end) {
        errors.push('Start date cannot be after end date');
      }
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Download blob as file
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename for download
   */
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default auditService;
