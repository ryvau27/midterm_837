import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientSearch from '../components/PatientSearch';
import PatientRecord from '../components/PatientRecord';
import BillingGenerator from '../components/BillingGenerator';

const PhysicianDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    // Keep on search tab to show the patient record
  };

  const handleBackToSearch = () => {
    setSelectedPatient(null);
    setActiveTab('search');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Physician Dashboard</h2>
        <p>Welcome, {user?.name} | <button onClick={logout} style={{ padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'search' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'search' ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Patient Search
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === 'billing' ? '#3498db' : '#ecf0f1',
              color: activeTab === 'billing' ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Billing
          </button>
        </div>

        {activeTab === 'search' && !selectedPatient && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <PatientSearch onPatientSelect={handlePatientSelect} />
          </div>
        )}

        {activeTab === 'search' && selectedPatient && (
          <div>
            <button
              onClick={handleBackToSearch}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              ← Back to Search
            </button>
            <PatientRecord patient={selectedPatient} />
          </div>
        )}

        {activeTab === 'billing' && (
          <BillingGenerator />
        )}
      </div>
    </div>
  );
};

export default PhysicianDashboard;
