import React, { useState } from 'react';

const VitalSignsForm = ({ onSubmit, loading }) => {
  const [vitalSigns, setVitalSigns] = useState([
    { measureType: 'temperature', value: '', unit: '°F' },
    { measureType: 'blood_pressure', value: '', unit: 'mmHg' },
    { measureType: 'heart_rate', value: '', unit: 'bpm' },
    { measureType: 'respiratory_rate', value: '', unit: 'breaths/min' }
  ]);

  const [errors, setErrors] = useState({});
  const [notes, setNotes] = useState('');

  const handleVitalSignChange = (index, field, value) => {
    const updatedVitals = [...vitalSigns];
    updatedVitals[index][field] = value;
    setVitalSigns(updatedVitals);

    // Clear error for this field
    if (errors[`vital_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`vital_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const addVitalSign = () => {
    setVitalSigns([...vitalSigns, { measureType: 'weight', value: '', unit: 'lbs' }]);
  };

  const removeVitalSign = (index) => {
    if (vitalSigns.length > 1) {
      const updatedVitals = vitalSigns.filter((_, i) => i !== index);
      setVitalSigns(updatedVitals);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let hasValidVital = false;

    vitalSigns.forEach((vital, index) => {
      if (vital.value && vital.value.trim() !== '') {
        hasValidVital = true;

        // Validate based on measure type
        switch (vital.measureType) {
          case 'temperature':
            const temp = parseFloat(vital.value);
            if (isNaN(temp) || temp < 95 || temp > 105) {
              newErrors[`vital_${index}_value`] = 'Temperature must be between 95°F and 105°F';
            }
            break;

          case 'blood_pressure':
            if (!vital.value.includes('/')) {
              newErrors[`vital_${index}_value`] = 'Blood pressure must be in systolic/diastolic format (e.g., 120/80)';
            } else {
              const [systolic, diastolic] = vital.value.split('/').map(v => parseInt(v.trim()));
              if (isNaN(systolic) || isNaN(diastolic)) {
                newErrors[`vital_${index}_value`] = 'Blood pressure values must be numeric';
              } else if (systolic < 80 || systolic > 200) {
                newErrors[`vital_${index}_value`] = 'Systolic pressure must be between 80 and 200';
              } else if (diastolic < 50 || diastolic > 120) {
                newErrors[`vital_${index}_value`] = 'Diastolic pressure must be between 50 and 120';
              } else if (systolic <= diastolic) {
                newErrors[`vital_${index}_value`] = 'Systolic pressure must be greater than diastolic';
              }
            }
            break;

          case 'heart_rate':
            const hr = parseInt(vital.value);
            if (isNaN(hr) || hr < 40 || hr > 200) {
              newErrors[`vital_${index}_value`] = 'Heart rate must be between 40 and 200 bpm';
            }
            break;

          case 'respiratory_rate':
            const rr = parseInt(vital.value);
            if (isNaN(rr) || rr < 8 || rr > 40) {
              newErrors[`vital_${index}_value`] = 'Respiratory rate must be between 8 and 40 breaths/min';
            }
            break;

          case 'weight':
            const weight = parseFloat(vital.value);
            if (isNaN(weight) || weight < 50 || weight > 500) {
              newErrors[`vital_${index}_value`] = 'Weight must be between 50 and 500 lbs';
            }
            break;

          case 'height':
            const height = parseFloat(vital.value);
            if (isNaN(height) || height < 24 || height > 84) {
              newErrors[`vital_${index}_value`] = 'Height must be between 24 and 84 inches';
            }
            break;

          default:
            break;
        }
      }
    });

    if (!hasValidVital) {
      newErrors.general = 'At least one vital sign measurement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty vital signs and prepare data
    const validVitals = vitalSigns
      .filter(vital => vital.value && vital.value.trim() !== '')
      .map(vital => ({
        measureType: vital.measureType,
        value: vital.value.trim(),
        unit: vital.unit
      }));

    onSubmit({
      vitalSigns: validVitals,
      notes: notes.trim()
    });
  };

  const getMeasureTypeOptions = () => [
    { value: 'temperature', label: 'Temperature' },
    { value: 'blood_pressure', label: 'Blood Pressure' },
    { value: 'heart_rate', label: 'Heart Rate' },
    { value: 'respiratory_rate', label: 'Respiratory Rate' },
    { value: 'weight', label: 'Weight' },
    { value: 'height', label: 'Height' }
  ];

  const getUnitOptions = (measureType) => {
    const unitMap = {
      temperature: ['°F'],
      blood_pressure: ['mmHg'],
      heart_rate: ['bpm'],
      respiratory_rate: ['breaths/min'],
      weight: ['lbs', 'kg'],
      height: ['inches', 'cm']
    };
    return unitMap[measureType] || [''];
  };

  return (
    <form onSubmit={handleSubmit} className="vital-signs-form">
      <h4>Record Vital Signs</h4>

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      <div className="vital-signs-list">
        {vitalSigns.map((vital, index) => (
          <div key={index} className="vital-sign-item">
            <div className="vital-sign-row">
              <select
                value={vital.measureType}
                onChange={(e) => handleVitalSignChange(index, 'measureType', e.target.value)}
                className="measure-type-select"
              >
                {getMeasureTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder={
                  vital.measureType === 'blood_pressure' ? '120/80' :
                  vital.measureType === 'temperature' ? '98.6' :
                  vital.measureType === 'heart_rate' ? '72' :
                  vital.measureType === 'respiratory_rate' ? '16' :
                  vital.measureType === 'weight' ? '150' :
                  vital.measureType === 'height' ? '68' : 'Value'
                }
                value={vital.value}
                onChange={(e) => handleVitalSignChange(index, 'value', e.target.value)}
                className={`value-input ${errors[`vital_${index}_value`] ? 'error' : ''}`}
              />

              <select
                value={vital.unit}
                onChange={(e) => handleVitalSignChange(index, 'unit', e.target.value)}
                className="unit-select"
              >
                {getUnitOptions(vital.measureType).map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              {vitalSigns.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVitalSign(index)}
                  className="remove-btn"
                  title="Remove this vital sign"
                >
                  ×
                </button>
              )}
            </div>

            {errors[`vital_${index}_value`] && (
              <div className="error-message">
                {errors[`vital_${index}_value`]}
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={addVitalSign} className="add-vital-btn">
        + Add Another Vital Sign
      </button>

      <div className="notes-section">
        <label htmlFor="notes">Additional Notes:</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about the vital signs recording..."
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Recording...' : 'Record Vital Signs'}
        </button>
      </div>

      <style jsx>{`
        .vital-signs-form {
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .general-error {
          background: #f8d7da;
          color: #721c24;
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
          margin-bottom: 1rem;
        }

        .vital-signs-list {
          margin-bottom: 1rem;
        }

        .vital-sign-item {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .vital-sign-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .measure-type-select,
        .unit-select {
          padding: 0.5rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          min-width: 120px;
        }

        .value-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .value-input.error {
          border-color: #dc3545;
        }

        .remove-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .remove-btn:hover {
          background: #c82333;
        }

        .add-vital-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 1.5rem;
        }

        .add-vital-btn:hover {
          background: #218838;
        }

        .notes-section {
          margin-bottom: 1.5rem;
        }

        .notes-section label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #495057;
        }

        .notes-section textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          resize: vertical;
        }

        .form-actions {
          text-align: center;
        }

        .submit-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        }

        .submit-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .submit-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
};

export default VitalSignsForm;
