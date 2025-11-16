import React, { useState } from 'react';
import api from '../services/api';

const PatientSelector = ({ onPatientSelect, selectedPatientId }) => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a patient name or ID to search');
      return;
    }

    setLoading(true);
    setError('');
    setPatients([]);

    try {
      const response = await api.get(`/patients/search?query=${encodeURIComponent(searchQuery.trim())}`);

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
      <h4>Search Patients</h4>
      <p style={{ color: '#6c757d', marginBottom: '1rem' }}>Enter a patient name or insurance ID to find their records.</p>

      <form onSubmit={handleSearch} className="search-container">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="search-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>

      {patients.length > 0 && (
        <div className="patient-list">
          <h5>Search Results ({patients.length}):</h5>
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

      {patients.length === 0 && !loading && searchQuery && !error && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          No patients found matching "{searchQuery}"
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
          padding: 2rem;
          background: white;
          border-radius: 8px;
        }

        .search-container {
          margin-bottom: 2rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .search-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .search-button:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .search-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .error-text {
          color: #dc3545;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: #f8d7da;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        }

        .patient-list {
          margin-top: 1rem;
        }

        .patient-list h5 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .patient-results {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .patient-item {
          padding: 1rem;
          border-bottom: 1px solid #ddd;
          cursor: pointer;
          transition: background-color 0.3s;
          background-color: #f8f9fa;
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
          color: #2c3e50;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .patient-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #666;
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
