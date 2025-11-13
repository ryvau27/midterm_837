/**
 * Client-side validation utilities for the Unified Patient Manager System
 * These mirror the server-side validation but provide immediate feedback to users
 */

// Vital signs validation ranges (matching server-side validation)
const VITAL_SIGNS_RANGES = {
  temperature: {
    min: 95.0,
    max: 105.0,
    unit: '°F',
    placeholder: '98.6'
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
    unit: 'bpm',
    placeholder: '72'
  },
  respiratory_rate: {
    min: 8,
    max: 40,
    unit: 'breaths/min',
    placeholder: '16'
  },
  weight: {
    min: 50,
    max: 500,
    unit: 'lbs',
    placeholder: '150'
  },
  height: {
    min: 24,
    max: 84,
    unit: 'inches',
    placeholder: '68'
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

/**
 * Validates a single vital sign reading (client-side)
 * @param {string} measureType - Type of vital sign
 * @param {string} value - The measured value as string
 * @param {string} unit - Unit of measurement
 * @returns {Object} Validation result with isValid and error message
 */
export function validateVitalSignField(measureType, value, unit) {
  if (!value || value.trim() === '') {
    return { isValid: true, error: '' }; // Empty values are allowed (optional)
  }

  // Check if measure type is valid
  if (!VALID_VITAL_TYPES.includes(measureType)) {
    return { isValid: false, error: `Invalid vital sign type: ${measureType}` };
  }

  // Check unit
  if (!VALID_UNITS[measureType].includes(unit)) {
    return { isValid: false, error: `Invalid unit "${unit}" for ${measureType}` };
  }

  // Special handling for blood pressure
  if (measureType === 'blood_pressure') {
    if (!value.includes('/')) {
      return { isValid: false, error: 'Blood pressure must be in format "systolic/diastolic" (e.g., 120/80)' };
    }

    const parts = value.split('/').map(v => v.trim());
    if (parts.length !== 2) {
      return { isValid: false, error: 'Blood pressure must have exactly two values separated by /' };
    }

    const [systolic, diastolic] = parts.map(v => parseFloat(v));

    if (isNaN(systolic) || isNaN(diastolic)) {
      return { isValid: false, error: 'Blood pressure values must be numeric' };
    }

    const systolicRange = VITAL_SIGNS_RANGES.blood_pressure_systolic;
    if (systolic < systolicRange.min || systolic > systolicRange.max) {
      return { isValid: false, error: `Systolic pressure must be between ${systolicRange.min} and ${systolicRange.max}` };
    }

    const diastolicRange = VITAL_SIGNS_RANGES.blood_pressure_diastolic;
    if (diastolic < diastolicRange.min || diastolic > diastolicRange.max) {
      return { isValid: false, error: `Diastolic pressure must be between ${diastolicRange.min} and ${diastolicRange.max}` };
    }

    if (systolic <= diastolic) {
      return { isValid: false, error: 'Systolic pressure must be greater than diastolic' };
    }

    return { isValid: true, error: '' };
  }

  // Numeric validation for other types
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: `${measureType.replace('_', ' ')} must be a valid number` };
  }

  const range = VITAL_SIGNS_RANGES[measureType];
  if (numValue < range.min || numValue > range.max) {
    return { isValid: false, error: `${measureType.replace('_', ' ')} must be between ${range.min} and ${range.max} ${range.unit}` };
  }

  return { isValid: true, error: '' };
}

/**
 * Validates an array of vital signs
 * @param {Array} vitalSigns - Array of vital sign objects
 * @returns {Object} Validation result with isValid and errors
 */
export function validateVitalSignsForm(vitalSigns) {
  const errors = {};
  let hasValidVital = false;

  vitalSigns.forEach((vital, index) => {
    if (vital.value && vital.value.trim() !== '') {
      hasValidVital = true;
      const validation = validateVitalSignField(vital.measureType, vital.value, vital.unit);

      if (!validation.isValid) {
        errors[`vital_${index}`] = validation.error;
      }
    }
  });

  if (!hasValidVital) {
    errors.general = 'At least one vital sign measurement is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Gets placeholder text for a vital sign type
 * @param {string} measureType - Type of vital sign
 * @returns {string} Placeholder text
 */
export function getVitalSignPlaceholder(measureType) {
  const range = VITAL_SIGNS_RANGES[measureType];
  return range?.placeholder || range?.min + '-' + range?.max || 'Enter value';
}

/**
 * Gets available measure types for dropdown
 * @returns {Array} Array of {value, label} objects
 */
export function getMeasureTypeOptions() {
  return [
    { value: 'temperature', label: 'Temperature' },
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'respiratory_rate', label: 'Respiratory Rate' },
    { value: 'weight', label: 'Weight' },
    { value: 'height', label: 'Height' }
  ];
}

/**
 * Gets available units for a measure type
 * @param {string} measureType - Type of vital sign
 * @returns {Array} Array of unit strings
 */
export function getUnitOptions(measureType) {
  return VALID_UNITS[measureType] || [''];
}

/**
 * Validates form input (generic text input validation)
 * @param {string} value - Input value
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export function validateInput(value, rules = {}) {
  const { required, minLength, maxLength, pattern, custom } = rules;

  if (required && (!value || value.trim() === '')) {
    return { isValid: false, error: 'This field is required' };
  }

  if (value && minLength && value.length < minLength) {
    return { isValid: false, error: `Minimum length is ${minLength} characters` };
  }

  if (value && maxLength && value.length > maxLength) {
    return { isValid: false, error: `Maximum length is ${maxLength} characters` };
  }

  if (value && pattern && !pattern.test(value)) {
    return { isValid: false, error: 'Invalid format' };
  }

  if (custom && typeof custom === 'function') {
    const customResult = custom(value);
    if (!customResult.isValid) {
      return customResult;
    }
  }

  return { isValid: true, error: '' };
}

// Export constants for use in components
export {
  VITAL_SIGNS_RANGES,
  VALID_VITAL_TYPES,
  VALID_UNITS
};
