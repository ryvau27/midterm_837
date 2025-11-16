import api from './api';

/**
 * Billing service for API communication
 */
const billingService = {
  /**
   * Get unbilled visits for current physician
   * @returns {Promise} API response with unbilled visits
   */
  getUnbilledVisits: async () => {
    try {
      const response = await api.get('/visits/unbilled');
      return response.data;
    } catch (error) {
      console.error('Error fetching unbilled visits:', error);
      throw error;
    }
  },

  /**
   * Generate billing summaries for selected visits
   * @param {Array} visitIds - Array of visit IDs to bill
   * @returns {Promise} API response with generated billing summaries
   */
  generateBilling: async (visitIds) => {
    try {
      const response = await api.post('/billing/generate', { visitIds });
      return response.data;
    } catch (error) {
      console.error('Error generating billing:', error);
      throw error;
    }
  },

  /**
   * Get billing statistics for current physician
   * @returns {Promise} API response with billing statistics
   */
  getBillingStats: async () => {
    try {
      const response = await api.get('/billing/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing stats:', error);
      throw error;
    }
  },

  /**
   * Get billing summary details
   * @param {number} billingId - Billing summary ID
   * @returns {Promise} API response with billing details
   */
  getBillingDetails: async (billingId) => {
    try {
      const response = await api.get(`/billing/${billingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching billing details:', error);
      throw error;
    }
  },

  /**
   * Submit billing to insurance provider
   * @param {number} billingId - Billing summary ID
   * @returns {Promise} API response with submission result
   */
  submitToInsurance: async (billingId) => {
    try {
      const response = await api.post(`/billing/${billingId}/submit`);
      return response.data;
    } catch (error) {
      console.error('Error submitting to insurance:', error);
      throw error;
    }
  },

  /**
   * Get all insurance providers
   * @returns {Promise} API response with insurance providers
   */
  getInsuranceProviders: async () => {
    try {
      const response = await api.get('/insurance/providers');
      return response.data;
    } catch (error) {
      console.error('Error fetching insurance providers:', error);
      throw error;
    }
  },

  /**
   * Submit billing to mock insurance (for demo purposes)
   * @param {Object} billingSummary - Billing summary object
   * @returns {Promise} Mock insurance response
   */
  submitToMockInsurance: async (billingSummary) => {
    try {
      const response = await api.post('/mock/insurance/submit', { billingSummary });
      return response.data;
    } catch (error) {
      console.error('Error submitting to mock insurance:', error);
      throw error;
    }
  },

  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  /**
   * Get status color for billing status
   * @param {string} status - Billing status
   * @returns {string} CSS color value
   */
  getStatusColor: (status) => {
    const colors = {
      pending: '#f39c12',
      submitted: '#3498db',
      paid: '#27ae60',
      denied: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  },

  /**
   * Get status display text
   * @param {string} status - Billing status
   * @returns {string} Human-readable status text
   */
  getStatusText: (status) => {
    const texts = {
      pending: 'Pending Submission',
      submitted: 'Submitted to Insurance',
      paid: 'Paid',
      denied: 'Denied'
    };
    return texts[status] || status.replace('_', ' ');
  },

  /**
   * Calculate total cost from billing summaries
   * @param {Array} billings - Array of billing summaries
   * @returns {number} Total cost
   */
  calculateTotal: (billings) => {
    return billings.reduce((total, billing) => total + billing.totalCost, 0);
  },

  /**
   * Group billings by status
   * @param {Array} billings - Array of billing summaries
   * @returns {Object} Grouped billings by status
   */
  groupByStatus: (billings) => {
    return billings.reduce((groups, billing) => {
      const status = billing.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(billing);
      return groups;
    }, {});
  },

  /**
   * Validate visit selection for billing
   * @param {Array} selectedVisits - Selected visit IDs
   * @param {Array} availableVisits - All available visits
   * @returns {Object} Validation result
   */
  validateVisitSelection: (selectedVisits, availableVisits) => {
    const errors = [];

    if (!selectedVisits || selectedVisits.length === 0) {
      errors.push('At least one visit must be selected');
    }

    const invalidVisits = selectedVisits.filter(id =>
      !availableVisits.some(visit => visit.visitID === id)
    );

    if (invalidVisits.length > 0) {
      errors.push(`Invalid visit IDs: ${invalidVisits.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default billingService;
