import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientSelector from '../components/PatientSelector';
import VitalSignsForm from '../components/VitalSignsForm';
import vitalService from '../services/vitalService';

const NurseDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setMessage('');
  };

  const handleVitalSignsSubmit = async (data) => {
    if (!selectedPatient) {
      setMessage('Please select a patient first');
      setMessageType('error');
      return;
    }

    setRecording(true);
    setMessage('');

    try {
      const response = await vitalService.recordVitalSigns(selectedPatient.personID, data);

      if (response.success) {
        setMessage(`Vital signs recorded successfully for ${selectedPatient.name}`);
        setMessageType('success');
        // Reset form by clearing patient selection
        setSelectedPatient(null);
      } else {
        setMessage(response.message || 'Failed to record vital signs');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error recording vital signs:', error);
      const errorMessage = error.response?.data?.message || 'Error recording vital signs. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Nurse Dashboard</h2>
        <p>Welcome, {user?.name} | <button onClick={logout}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="dashboard-section">
          <PatientSelector
            onPatientSelect={handlePatientSelect}
            selectedPatientId={selectedPatient?.personID}
          />
        </div>

        {selectedPatient && (
          <div className="dashboard-section">
            <div className="selected-patient-display">
              <h4>Recording Vital Signs for: {selectedPatient.name}</h4>
              <p>Patient ID: {selectedPatient.personID}</p>
              {selectedPatient.dateOfBirth && (
                <p>Date of Birth: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
              )}
            </div>

            <VitalSignsForm
              onSubmit={handleVitalSignsSubmit}
              loading={recording}
            />
          </div>
        )}

        {!selectedPatient && (
          <div className="dashboard-section">
            <div className="instructions">
              <h4>Instructions</h4>
              <ol>
                <li>Select a patient from the search above</li>
                <li>Fill in the vital signs measurements</li>
                <li>Add any additional notes if needed</li>
                <li>Click "Record Vital Signs" to save</li>
              </ol>

              <h5>Vital Signs Guidelines</h5>
              <ul>
                <li><strong>Temperature:</strong> 95.0°F - 105.0°F</li>
                <li><strong>Blood Pressure:</strong> Systolic 80-200, Diastolic 50-120 mmHg (format: 120/80)</li>
                <li><strong>Heart Rate:</strong> 40-200 bpm</li>
                <li><strong>Respiratory Rate:</strong> 8-40 breaths/min</li>
                <li><strong>Weight:</strong> 50-500 lbs or kg</li>
                <li><strong>Height:</strong> 24-84 inches or cm</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-header {
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #495057;
        }

        .dashboard-header p {
          margin: 0;
          color: #6c757d;
        }

        .dashboard-header button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .dashboard-header button:hover {
          background: #c82333;
        }

        .dashboard-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .dashboard-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .selected-patient-display {
          padding: 1.5rem;
          background: #e9ecef;
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid #dee2e6;
        }

        .selected-patient-display h4 {
          margin: 0 0 0.5rem 0;
          color: #495057;
        }

        .selected-patient-display p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .instructions {
          padding: 2rem;
        }

        .instructions h4 {
          color: #495057;
          margin-bottom: 1rem;
        }

        .instructions ol, .instructions ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .instructions li {
          margin: 0.5rem 0;
          color: #6c757d;
        }

        .instructions h5 {
          color: #495057;
          margin: 1.5rem 0 0.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default NurseDashboard;
