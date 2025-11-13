import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuditLogViewer from '../components/AuditLogViewer';
import auditService from '../services/auditService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadAuditStats();
  }, []);

  const loadAuditStats = async () => {
    try {
      const response = await auditService.getAuditStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading audit stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h2>System Administrator Portal</h2>
            <p>Welcome back, {user?.name} | <button onClick={logout}>Logout</button></p>
          </div>

          {stats && (
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-number">{stats.totalLogs}</div>
                <div className="stat-label">Total Audit Logs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.loginAttempts}</div>
                <div className="stat-label">Login Attempts</div>
              </div>
              <div className="stat-card success">
                <div className="stat-number">{stats.successfulLogins}</div>
                <div className="stat-label">Successful Logins</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-number">{stats.failedLogins}</div>
                <div className="stat-label">Failed Logins</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h3>Audit Log Management</h3>
          <p>
            Monitor system access, login attempts, and security events for HIPAA compliance and system security.
            All administrator actions are logged for accountability.
          </p>

          <div className="security-notice">
            <strong>🔒 Security Notice:</strong> This system logs all access attempts and maintains audit trails
            for compliance with healthcare regulations. Access is restricted to authorized administrators only.
          </div>
        </div>

        <div className="audit-section">
          <AuditLogViewer />
        </div>

        <div className="admin-info">
          <h4>Administrator Responsibilities</h4>
          <div className="info-grid">
            <div className="info-item">
              <h5>📊 Audit Monitoring</h5>
              <p>Regularly review audit logs for suspicious activity and security incidents.</p>
            </div>
            <div className="info-item">
              <h5>🔐 Access Control</h5>
              <p>Ensure proper role-based access controls are maintained across the system.</p>
            </div>
            <div className="info-item">
              <h5>📋 Compliance Reporting</h5>
              <p>Generate reports for HIPAA compliance and security audits as required.</p>
            </div>
            <div className="info-item">
              <h5>🚨 Incident Response</h5>
              <p>Respond to security incidents and maintain incident response procedures.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
        }

        .header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header-info h2 {
          margin: 0;
          background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2rem;
          font-weight: 700;
        }

        .header-info p {
          margin: 0;
          color: #4a5568;
          font-weight: 500;
        }

        .header-info button {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(229, 62, 62, 0.3);
        }

        .header-info button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(229, 62, 62, 0.4);
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .stat-card.success {
          border-left: 4px solid #48bb78;
        }

        .stat-card.warning {
          border-left: 4px solid #ed8936;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #718096;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
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

        .security-notice {
          background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
          color: #c53030;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #e53e3e;
          font-weight: 500;
        }

        .audit-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .admin-info {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .admin-info h4 {
          margin: 0 0 1.5rem 0;
          color: #2d3748;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .info-item h5 {
          margin: 0 0 0.75rem 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .info-item p {
          margin: 0;
          color: #4a5568;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
          }

          .header-info {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-info h2 {
            font-size: 1.5rem;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-content {
            padding: 1rem;
          }

          .welcome-section, .audit-section, .admin-info {
            padding: 1.5rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
