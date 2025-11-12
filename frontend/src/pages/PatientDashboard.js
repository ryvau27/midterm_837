import React from 'react';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Patient Dashboard</h2>
        <p>Welcome, {user?.name} | <button onClick={logout}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>My Medical Records</h3>
          <p>View your personal medical information including visit history, vital signs, and prescriptions.</p>
          <p><em>Implementation in progress...</em></p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
