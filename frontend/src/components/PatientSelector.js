import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PatientSelector = ({ onPatientSelect, selectedPatientId }) => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search patients when search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  const searchPatients = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/patients/search?query=${encodeURIComponent(searchQuery)}`);

      if (response.data.success) {
        setPatients(response.data.data);
      } else {
        setError('Failed to search patients');
      }
    } catch (err) {
      console.error('Patient search error:', err);
      setError('Error searching patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient);
    setSearchQuery(''); // Clear search after selection
    setPatients([]); // Clear results after selection
  };

  return (
    <div className="patient-selector">
      <h4>Select Patient</h4>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />

        {loading && <p className="loading-text">Searching...</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      {patients.length > 0 && (
        <div className="patient-list">
          <h5>Search Results:</h5>
          <div className="patient-results">
            {patients.map((patient) => (
              <div
                key={patient.personID}
                className={`patient-item ${selectedPatientId === patient.personID ? 'selected' : ''}`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="patient-info">
                  <strong>{patient.name}</strong>
                  <div className="patient-details">
                    <span>ID: {patient.personID}</span>
                    {patient.insuranceID && <span>Insurance: {patient.insuranceID}</span>}
                    {patient.dateOfBirth && <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPatientId && (
        <div className="selected-patient">
          <h5>Selected Patient:</h5>
          {patients.find(p => p.personID === selectedPatientId) && (
            <div className="selected-patient-info">
              <strong>{patients.find(p => p.personID === selectedPatientId).name}</strong>
              <span> (ID: {selectedPatientId})</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .patient-selector {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .search-container {
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 1rem;
        }

        .loading-text {
          color: #6c757d;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .error-text {
          color: #dc3545;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .patient-list {
          margin-top: 1rem;
        }

        .patient-results {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: white;
        }

        .patient-item {
          padding: 0.75rem;
          border-bottom: 1px solid #dee2e6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .patient-item:hover {
          background-color: #e9ecef;
        }

        .patient-item.selected {
          background-color: #d1ecf1;
          border-left: 4px solid #17a2b8;
        }

        .patient-item:last-child {
          border-bottom: none;
        }

        .patient-info strong {
          display: block;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .patient-details {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .selected-patient {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
        }

        .selected-patient-info {
          color: #155724;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default PatientSelector;
