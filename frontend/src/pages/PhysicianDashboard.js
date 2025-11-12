import React from 'react';
import { useAuth } from '../context/AuthContext';

const PhysicianDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Physician Dashboard</h2>
        <p>Welcome, {user?.name} | <button onClick={logout}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Available Features</h3>
          <ul>
            <li>Search and view patient records</li>
            <li>Generate billing summaries</li>
            <li>View visit history</li>
          </ul>
          <p><em>Implementation in progress...</em></p>
        </div>
      </div>
    </div>
  );
};

export default PhysicianDashboard;
