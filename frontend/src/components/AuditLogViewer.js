import React, { useState, useEffect } from 'react';
import auditService from '../services/auditService';
import AuditLogFilters from './AuditLogFilters';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    page: 1,
    limit: 25
  });

  useEffect(() => {
    loadAuditLogs();
  }, [currentFilters]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await auditService.getAuditLogs(currentFilters);
      setLogs(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters) => {
    setCurrentFilters({
      ...filters,
      page: 1, // Reset to first page when filters change
      limit: currentFilters.limit
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentFilters({
      ...currentFilters,
      page: newPage
    });
  };

  const handleLimitChange = (newLimit) => {
    setCurrentFilters({
      ...currentFilters,
      page: 1, // Reset to first page when limit changes
      limit: newLimit
    });
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await auditService.exportAuditLogs(currentFilters, format);
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      auditService.downloadBlob(response.data, filename);
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      setError('Failed to export audit logs');
    }
  };

  const refreshLogs = () => {
    loadAuditLogs();
  };

  return (
    <div className="audit-log-viewer">
      <div className="viewer-header">
        <div className="header-info">
          <h3>Audit Log Viewer</h3>
          <p>Monitor system access and security events</p>
        </div>

        <div className="header-actions">
          <button onClick={refreshLogs} className="refresh-btn" disabled={loading}>
            🔄 Refresh
          </button>
          <button onClick={() => handleExport('json')} className="export-btn">
            📄 Export JSON
          </button>
          <button onClick={() => handleExport('csv')} className="export-btn">
            📊 Export CSV
          </button>
        </div>
      </div>

      <AuditLogFilters
        onFiltersChange={handleFiltersChange}
        initialFilters={currentFilters}
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="logs-section">
        <div className="logs-header">
          <h4>Audit Logs</h4>
          {pagination && (
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="no-logs">
            <div className="no-logs-icon">📋</div>
            <h4>No Audit Logs Found</h4>
            <p>No logs match the current filter criteria.</p>
          </div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.logID}>
                    <td className="timestamp">
                      {auditService.formatTimestamp(log.timestamp)}
                    </td>
                    <td className="user">
                      <div className="user-info">
                        <strong>{log.userName || `User ${log.userID}`}</strong>
                        <small>ID: {log.userID}</small>
                      </div>
                    </td>
                    <td className="role">
                      <span className={`role-badge role-${log.userRole}`}>
                        {auditService.getRoleText(log.userRole)}
                      </span>
                    </td>
                    <td className="action">
                      <span
                        className="action-badge"
                        style={{ backgroundColor: auditService.getActionTypeColor(log.actionType) }}
                      >
                        {auditService.getActionTypeText(log.actionType)}
                      </span>
                    </td>
                    <td className="ip-address">
                      {log.ipAddress || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <div className="pagination-buttons">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="page-btn"
              >
                ← Previous
              </button>

              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="page-btn"
              >
                Next →
              </button>
            </div>

            <div className="page-size-selector">
              <label htmlFor="pageSize">Show:</label>
              <select
                id="pageSize"
                value={currentFilters.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .audit-log-viewer {
          max-width: 1400px;
          margin: 0 auto;
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .header-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .header-info p {
          margin: 0;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .refresh-btn, .export-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover:not(:disabled), .export-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #feb2b2;
          margin-bottom: 1.5rem;
        }

        .logs-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          border: 1px solid #e2e8f0;
        }

        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .logs-header h4 {
          margin: 0;
          color: #2d3748;
          font-size: 1.3rem;
        }

        .pagination-info {
          color: #718096;
          font-size: 0.9rem;
        }

        .loading-container, .no-logs {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-logs-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .logs-table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
          background: #f8fafc;
          color: #4a5568;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .logs-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        .timestamp {
          color: #4a5568;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
        }

        .user-info strong {
          color: #2d3748;
          display: block;
        }

        .user-info small {
          color: #718096;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-physician {
          background: #bee3f8;
          color: #2b6cb0;
        }

        .role-patient {
          background: #c6f6d5;
          color: #276749;
        }

        .role-nurse {
          background: #fed7e2;
          color: #b83280;
        }

        .role-admin {
          background: #fef5e7;
          color: #d69e2e;
        }

        .action-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .ip-address {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          color: #718096;
        }

        .pagination-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f1f5f9;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .page-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .page-btn:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .page-info {
          color: #4a5568;
          font-weight: 500;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-size-selector label {
          color: #4a5568;
          font-size: 0.9rem;
        }

        .page-size-selector select {
          padding: 0.25rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .page-size-selector span {
          color: #718096;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .viewer-header {
            flex-direction: column;
            gap: 1.5rem;
          }

          .logs-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .logs-table {
            font-size: 0.8rem;
          }

          .logs-table th, .logs-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditLogViewer;
