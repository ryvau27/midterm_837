import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>System Administrator Dashboard</h2>
        <p>Welcome, {user?.name} | <button onClick={logout}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Audit Log Review</h3>
          <p>Monitor system access and login attempts for security and compliance purposes.</p>
          <p><em>Implementation in progress...</em></p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
