import React, { useState } from 'react';
import auditService from '../services/auditService';

const AuditLogFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    userType: initialFilters.userType || 'all',
    actionType: initialFilters.actionType || 'all',
    ...initialFilters
  });

  const [errors, setErrors] = useState({});

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // Clear field-specific errors
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    // Auto-apply filters for instant feedback
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleDateChange = (field, value) => {
    // Ensure end date is not before start date
    if (field === 'endDate' && filters.startDate && value < filters.startDate) {
      setErrors({ ...errors, endDate: 'End date cannot be before start date' });
      return;
    }

    if (field === 'startDate' && filters.endDate && value > filters.endDate) {
      setErrors({ ...errors, startDate: 'Start date cannot be after end date' });
      return;
    }

    handleFilterChange(field, value);
  };

  const clearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      userType: 'all',
      actionType: 'all'
    };
    setFilters(clearedFilters);
    setErrors({});

    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getOneWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const setQuickDateRange = (range) => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      default:
        break;
    }

    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    setErrors({});

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  return (
    <div className="audit-filters">
      <div className="filters-header">
        <h4>Filter Audit Logs</h4>
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All Filters
        </button>
      </div>

      <div className="filters-content">
        {/* Date Range Filters */}
        <div className="filter-group">
          <h5>Date Range</h5>

          <div className="date-inputs">
            <div className="date-field">
              <label htmlFor="startDate">From:</label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className={errors.startDate ? 'error' : ''}
                max={getTodayDate()}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="date-field">
              <label htmlFor="endDate">To:</label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className={errors.endDate ? 'error' : ''}
                max={getTodayDate()}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="quick-dates">
            <span>Quick select:</span>
            <button onClick={() => setQuickDateRange('today')} className="quick-date-btn">
              Today
            </button>
            <button onClick={() => setQuickDateRange('week')} className="quick-date-btn">
              Last 7 Days
            </button>
            <button onClick={() => setQuickDateRange('month')} className="quick-date-btn">
              Last 30 Days
            </button>
          </div>
        </div>

        {/* User Type Filter */}
        <div className="filter-group">
          <h5>User Type</h5>
          <select
            value={filters.userType}
            onChange={(e) => handleFilterChange('userType', e.target.value)}
            className="filter-select"
          >
            {auditService.getUserTypeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Type Filter */}
        <div className="filter-group">
          <h5>Action Type</h5>
          <select
            value={filters.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            className="filter-select"
          >
            {auditService.getActionTypeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <style jsx>{`
        .audit-filters {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .filters-header h4 {
          margin: 0;
          color: #2d3748;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .clear-filters-btn {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .clear-filters-btn:hover {
          background: #cbd5e0;
          color: #2d3748;
        }

        .filters-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .filter-group {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .filter-group h5 {
          margin: 0 0 0.75rem 0;
          color: #4a5568;
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .date-field {
          display: flex;
          flex-direction: column;
        }

        .date-field label {
          font-size: 0.85rem;
          color: #4a5568;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .date-field input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .date-field input.error {
          border-color: #e53e3e;
        }

        .error-text {
          color: #e53e3e;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .quick-dates {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .quick-dates span {
          color: #4a5568;
          font-size: 0.85rem;
        }

        .quick-date-btn {
          background: #edf2f7;
          color: #4a5568;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .quick-date-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e0;
        }

        .filter-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9rem;
          background: white;
        }

        @media (max-width: 768px) {
          .filters-content {
            grid-template-columns: 1fr;
          }

          .date-inputs {
            grid-template-columns: 1fr;
          }

          .filters-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditLogFilters;
