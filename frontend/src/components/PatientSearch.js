import React, { useState } from 'react';
import { patientAPI } from '../services/api';

const PatientSearch = ({ onPatientSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a patient name or ID to search');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const response = await patientAPI.search(searchQuery.trim());
      setSearchResults(response.data || []);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientClick = (patient) => {
    // Just pass the patient object - PatientRecord will fetch the full record
    onPatientSelect(patient);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3>Search Patients</h3>
      <p>Enter a patient name or insurance ID to find their records.</p>

      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter patient name or insurance ID..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isSearching ? '#bdc3c7' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#e74c3c',
          color: 'white',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h4>Search Results ({searchResults.length})</h4>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {searchResults.map((patient) => (
              <div
                key={patient.personID}
                onClick={() => handlePatientClick(patient)}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#f8f9fa',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              >
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {patient.name}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Insurance ID: {patient.insuranceID || 'Not provided'}
                </div>
                {patient.dateOfBirth && (
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                  Click to view complete medical record
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !isSearching && searchQuery && !error && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          fontStyle: 'italic'
        }}>
          No patients found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
