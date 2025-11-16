import React from 'react';
import { useAuth } from '../context/AuthContext';
import PatientRecordView from '../components/PatientRecordView';

const PatientDashboard = () => {
  const { user, logout } = useAuth();

  console.log('[PatientDashboard] Rendered for user:', user);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>My Health Portal</h2>
        <p>Welcome back, {user?.name} | <button onClick={logout}>Logout</button></p>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h3>Your Medical Records</h3>
          <p>
            This is your secure portal to view your complete medical history.
            All information displayed here is read-only and intended for your reference only.
          </p>
          <div className="privacy-notice">
            <strong>🔒 Privacy Notice:</strong> Your medical information is protected under HIPAA guidelines.
            Only you and your authorized healthcare providers can access this data.
          </div>
        </div>

        <div className="records-container">
          <PatientRecordView />
        </div>

        <div className="help-section">
          <h4>Need Help?</h4>
          <div className="help-content">
            <div className="help-item">
              <h5>📞 Contact Your Healthcare Provider</h5>
              <p>If you have questions about your medical records or need to schedule an appointment, please contact your healthcare provider directly.</p>
            </div>
            <div className="help-item">
              <h5>🔒 Data Security</h5>
              <p>Your medical information is encrypted and securely stored. Access is logged for audit purposes to ensure HIPAA compliance.</p>
            </div>
            <div className="help-item">
              <h5>📋 Understanding Your Records</h5>
              <p>Medical records contain your visit history, vital signs measurements, prescribed medications, and physician notes from your healthcare visits.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h2 {
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .dashboard-header p {
          margin: 0;
          color: #4a5568;
          font-weight: 500;
        }

        .dashboard-header button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        }

        .dashboard-header button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4);
        }

        .dashboard-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .welcome-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .welcome-section h3 {
          margin: 0 0 1rem 0;
          color: #2d3748;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .welcome-section p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .privacy-notice {
          background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
          color: #c53030;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #e53e3e;
          font-weight: 500;
        }

        .records-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .help-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .help-section h4 {
          margin: 0 0 1.5rem 0;
          color: #2d3748;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .help-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .help-item {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .help-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .help-item h5 {
          margin: 0 0 0.75rem 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .help-item p {
          margin: 0;
          color: #4a5568;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .welcome-section, .records-container, .help-section {
            padding: 1.5rem;
          }

          .help-content {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .dashboard-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
