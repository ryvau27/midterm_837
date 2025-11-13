/**
 * Validation utilities for the Unified Patient Manager System
 */

// Vital signs validation ranges (based on medical standards)
const VITAL_SIGNS_RANGES = {
  temperature: {
    min: 95.0,
    max: 105.0,
    unit: '°F'
  },
  blood_pressure_systolic: {
    min: 80,
    max: 200,
    unit: 'mmHg'
  },
  blood_pressure_diastolic: {
    min: 50,
    max: 120,
    unit: 'mmHg'
  },
  heart_rate: {
    min: 40,
    max: 200,
    unit: 'bpm'
  },
  respiratory_rate: {
    min: 8,
    max: 40,
    unit: 'breaths/min'
  },
  weight: {
    min: 50,
    max: 500,
    unit: 'lbs'
  },
  height: {
    min: 24,
    max: 84,
    unit: 'inches'
  }
};

// Valid vital sign types
const VALID_VITAL_TYPES = [
  'temperature',
  'blood_pressure',
  'heart_rate',
  'respiratory_rate',
  'weight',
  'height'
];

// Valid units for each vital sign type
const VALID_UNITS = {
  temperature: ['°F'],
  blood_pressure: ['mmHg'],
  heart_rate: ['bpm'],
  respiratory_rate: ['breaths/min'],
  weight: ['lbs', 'kg'],
  height: ['inches', 'cm']
};

// Valid roles
const VALID_ROLES = ['physician', 'patient', 'nurse', 'admin'];

// Valid shifts for nurses
const VALID_SHIFTS = ['day', 'night', 'evening'];

/**
 * Validates a single vital sign reading
 * @param {string} measureType - Type of vital sign
 * @param {number|string} value - The measured value
 * @param {string} unit - Unit of measurement
 * @returns {Object} Validation result with isValid and errors
 */
function validateVitalSign(measureType, value, unit) {
  const errors = [];
  let numericValue;

  // Check if measure type is valid
  if (!VALID_VITAL_TYPES.includes(measureType)) {
    errors.push(`Invalid vital sign type: ${measureType}`);
    return { isValid: false, errors };
  }

  // Convert value to number if it's a string
  if (typeof value === 'string') {
    // Handle blood pressure format like "120/80"
    if (measureType === 'blood_pressure' && value.includes('/')) {
      const [systolic, diastolic] = value.split('/').map(v => parseFloat(v.trim()));
      if (isNaN(systolic) || isNaN(diastolic)) {
        errors.push('Blood pressure must be in format "systolic/diastolic" with numeric values');
        return { isValid: false, errors };
      }

      // Validate systolic
      const systolicRange = VITAL_SIGNS_RANGES.blood_pressure_systolic;
      if (systolic < systolicRange.min || systolic > systolicRange.max) {
        errors.push(`Systolic blood pressure must be between ${systolicRange.min} and ${systolicRange.max} ${systolicRange.unit}`);
      }

      // Validate diastolic
      const diastolicRange = VITAL_SIGNS_RANGES.blood_pressure_diastolic;
      if (diastolic < diastolicRange.min || diastolic > diastolicRange.max) {
        errors.push(`Diastolic blood pressure must be between ${diastolicRange.min} and ${diastolicRange.max} ${diastolicRange.unit}`);
      }

      // Check if systolic > diastolic
      if (systolic <= diastolic) {
        errors.push('Systolic blood pressure must be greater than diastolic');
      }

      return {
        isValid: errors.length === 0,
        errors,
        parsedValue: `${systolic}/${diastolic}`
      };
    } else {
      numericValue = parseFloat(value);
    }
  } else {
    numericValue = value;
  }

  // Check if value is a valid number
  if (isNaN(numericValue)) {
    errors.push(`${measureType} value must be a valid number`);
    return { isValid: false, errors };
  }

  // Validate unit
  if (!VALID_UNITS[measureType].includes(unit)) {
    errors.push(`Invalid unit "${unit}" for ${measureType}. Valid units: ${VALID_UNITS[measureType].join(', ')}`);
  }

  // Get validation range
  let range;
  if (measureType === 'blood_pressure') {
    // For single blood pressure values (systolic or diastolic)
    const isSystolic = unit === 'mmHg' && numericValue > 120; // Rough heuristic
    range = isSystolic ? VITAL_SIGNS_RANGES.blood_pressure_systolic : VITAL_SIGNS_RANGES.blood_pressure_diastolic;
  } else {
    range = VITAL_SIGNS_RANGES[measureType];
  }

  // Validate range
  if (numericValue < range.min || numericValue > range.max) {
    errors.push(`${measureType} must be between ${range.min} and ${range.max} ${range.unit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsedValue: numericValue
  };
}

/**
 * Validates an array of vital signs
 * @param {Array} vitalSigns - Array of vital sign objects
 * @returns {Object} Validation result with isValid and errors
 */
function validateVitalSigns(vitalSigns) {
  const allErrors = [];
  const validatedVitals = [];

  if (!Array.isArray(vitalSigns)) {
    return {
      isValid: false,
      errors: ['Vital signs must be provided as an array']
    };
  }

  vitalSigns.forEach((vital, index) => {
    const { measureType, value, unit } = vital;

    if (!measureType || value === undefined || !unit) {
      allErrors.push(`Vital sign ${index + 1}: measureType, value, and unit are required`);
      return;
    }

    const validation = validateVitalSign(measureType, value, unit);

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        allErrors.push(`Vital sign ${index + 1} (${measureType}): ${error}`);
      });
    } else {
      validatedVitals.push({
        measureType,
        value: validation.parsedValue,
        unit
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validatedVitals
  };
}

/**
 * Validates a user role
 * @param {string} role - User role to validate
 * @returns {boolean} True if valid
 */
function validateRole(role) {
  return VALID_ROLES.includes(role);
}

/**
 * Validates a nurse shift
 * @param {string} shift - Shift to validate
 * @returns {boolean} True if valid
 */
function validateShift(shift) {
  return VALID_SHIFTS.includes(shift);
}

/**
 * Sanitizes input string (basic XSS protection)
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
function validatePhone(phone) {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

module.exports = {
  validateVitalSign,
  validateVitalSigns,
  validateRole,
  validateShift,
  sanitizeInput,
  validateEmail,
  validatePhone,
  VITAL_SIGNS_RANGES,
  VALID_VITAL_TYPES,
  VALID_UNITS,
  VALID_ROLES,
  VALID_SHIFTS
};
