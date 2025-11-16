import { patientAPI } from './api';

/**
 * Patient service for API communication
 */
const patientService = {
  /**
   * Get current patient's own medical record
   * @returns {Promise} API response with patient's medical data
   */
  getOwnMedicalRecord: async () => {
    try {
      const response = await patientAPI.getOwnData();
      return response;
    } catch (error) {
      console.error('Error fetching own medical record:', error);
      throw error;
    }
  },

  /**
   * Format contact information for display
   * @param {string} contactInfo - JSON string of contact info
   * @returns {Object} Parsed contact information
   */
  formatContactInfo: (contactInfo) => {
    try {
      return JSON.parse(contactInfo || '{}');
    } catch (error) {
      console.error('Error parsing contact info:', error);
      return {};
    }
  },

  /**
   * Format emergency contact information
   * @param {string} emergencyContact - JSON string of emergency contact
   * @returns {Object} Parsed emergency contact information
   */
  formatEmergencyContact: (emergencyContact) => {
    try {
      return JSON.parse(emergencyContact || '{}');
    } catch (error) {
      console.error('Error parsing emergency contact:', error);
      return {};
    }
  },

  /**
   * Get a user-friendly display name for vital sign type
   * @param {string} measureType - The measure type
   * @returns {string} Display name
   */
  getVitalSignDisplayName: (measureType) => {
    const names = {
      temperature: 'Temperature',
      blood_pressure: 'Blood Pressure',
      heart_rate: 'Heart Rate',
      respiratory_rate: 'Respiratory Rate',
      weight: 'Weight',
      height: 'Height'
    };
    return names[measureType] || measureType.replace('_', ' ');
  },

  /**
   * Format vital sign value for display
   * @param {Object} vitalSign - Vital sign object
   * @returns {string} Formatted value
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
   * Get status color for visit status
   * @param {string} status - Visit status
   * @returns {string} CSS color value
   */
  getVisitStatusColor: (status) => {
    const colors = {
      completed: '#27ae60',
      in_progress: '#f39c12',
      scheduled: '#3498db',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  },

  /**
   * Check if patient has any medical records
   * @param {Object} medicalRecord - Medical record data
   * @returns {boolean} True if records exist
   */
  hasMedicalRecords: (medicalRecord) => {
    return medicalRecord &&
           medicalRecord.records &&
           medicalRecord.records.length > 0;
  },

  /**
   * Get summary stats for patient's medical history
   * @param {Object} medicalRecord - Medical record data
   * @returns {Object} Summary statistics
   */
  getMedicalSummary: (medicalRecord) => {
    if (!medicalRecord || !medicalRecord.records) {
      return {
        totalRecords: 0,
        totalVisits: 0,
        totalVitalSigns: 0,
        totalPrescriptions: 0
      };
    }

    let totalVisits = 0;
    let totalVitalSigns = 0;
    let totalPrescriptions = 0;

    medicalRecord.records.forEach(record => {
      if (record.visits) {
        totalVisits += record.visits.length;

        record.visits.forEach(visit => {
          if (visit.vitalSigns) {
            totalVitalSigns += visit.vitalSigns.length;
          }
          if (visit.prescriptions) {
            totalPrescriptions += visit.prescriptions.length;
          }
        });
      }
    });

    return {
      totalRecords: medicalRecord.records.length,
      totalVisits,
      totalVitalSigns,
      totalPrescriptions
    };
  }
};

export default patientService;
