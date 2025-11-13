import api from './api';

/**
 * Vital signs service for API communication
 */
const vitalService = {
  /**
   * Record vital signs for a patient
   * @param {number} patientId - Patient ID
   * @param {Object} data - Vital signs data
   * @param {Array} data.vitalSigns - Array of vital sign objects
   * @param {number} data.visitId - Optional visit ID
   * @param {string} data.notes - Optional notes
   * @returns {Promise} API response
   */
  recordVitalSigns: async (patientId, data) => {
    try {
      const response = await api.post(`/patients/${patientId}/vitals`, {
        vitalSigns: data.vitalSigns,
        visitId: data.visitId,
        notes: data.notes
      });
      return response.data;
    } catch (error) {
      console.error('Error recording vital signs:', error);
      throw error;
    }
  },

  /**
   * Get vital signs for a patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} API response with vital signs data
   */
  getPatientVitals: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/vitals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient vital signs:', error);
      throw error;
    }
  },

  /**
   * Get vital signs for a specific visit
   * @param {number} visitId - Visit ID
   * @returns {Promise} API response with vital signs data
   */
  getVisitVitals: async (visitId) => {
    try {
      const response = await api.get(`/visits/${visitId}/vitals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching visit vital signs:', error);
      throw error;
    }
  },

  /**
   * Format vital sign value for display
   * @param {Object} vitalSign - Vital sign object
   * @returns {string} Formatted display value
   */
  formatVitalSignValue: (vitalSign) => {
    const { measureType, value, unit } = vitalSign;

    switch (measureType) {
      case 'blood_pressure':
        return `${value} ${unit}`;
      case 'temperature':
        return `${value}°${unit === '°F' ? 'F' : 'C'}`;
      default:
        return `${value} ${unit}`;
    }
  },

  /**
   * Get user-friendly label for measure type
   * @param {string} measureType - Measure type
   * @returns {string} Display label
   */
  getMeasureTypeLabel: (measureType) => {
    const labels = {
      temperature: 'Temperature',
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      respiratory_rate: 'Respiratory Rate',
      weight: 'Weight',
      height: 'Height'
    };
    return labels[measureType] || measureType;
  },

  /**
   * Check if vital sign is within normal range
   * @param {Object} vitalSign - Vital sign object
   * @returns {string} 'normal', 'low', 'high', or 'unknown'
   */
  getVitalSignStatus: (vitalSign) => {
    const { measureType, value, unit } = vitalSign;

    // Define normal ranges (simplified)
    const normalRanges = {
      temperature: { min: 97.0, max: 99.0, unit: '°F' },
      blood_pressure: {
        systolic: { min: 90, max: 140 },
        diastolic: { min: 60, max: 90 },
        unit: 'mmHg'
      },
      heart_rate: { min: 60, max: 100, unit: 'bpm' },
      respiratory_rate: { min: 12, max: 20, unit: 'breaths/min' },
      weight: { min: 100, max: 300, unit: 'lbs' }, // Very rough
      height: { min: 60, max: 78, unit: 'inches' } // Very rough
    };

    const range = normalRanges[measureType];
    if (!range) return 'unknown';

    if (measureType === 'blood_pressure' && value.includes('/')) {
      const [systolic, diastolic] = value.split('/').map(v => parseFloat(v));
      const systolicStatus = systolic < range.systolic.min ? 'low' :
                           systolic > range.systolic.max ? 'high' : 'normal';
      const diastolicStatus = diastolic < range.diastolic.min ? 'low' :
                            diastolic > range.diastolic.max ? 'high' : 'normal';

      if (systolicStatus !== 'normal' || diastolicStatus !== 'normal') {
        return systolicStatus !== 'normal' ? systolicStatus : diastolicStatus;
      }
      return 'normal';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'unknown';

    if (numValue < range.min) return 'low';
    if (numValue > range.max) return 'high';
    return 'normal';
  }
};

export default vitalService;
