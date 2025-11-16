import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';

const PatientRecordView = () => {
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedicalRecord();
  }, []);

  const loadMedicalRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientService.getOwnMedicalRecord();
      setMedicalRecord(response.data);
    } catch (err) {
      console.error('Error loading medical record:', err);
      setError(err.message || 'Failed to load your medical record');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your medical record...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Medical Record</h3>
        <p>{error}</p>
        <button onClick={loadMedicalRecord} className="retry-btn">
          Try Again
        </button>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 3rem;
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            color: #c53030;
          }

          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .retry-btn {
            background: #3182ce;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          }

          .retry-btn:hover {
            background: #2c5282;
          }
        `}</style>
      </div>
    );
  }

  if (!medicalRecord) {
    return (
      <div className="no-record-container">
        <div className="no-record-icon">📋</div>
        <h3>No Medical Records Found</h3>
        <p>You don't have any medical records in the system yet.</p>
        <p>If you believe this is an error, please contact your healthcare provider.</p>
        <style jsx>{`
          .no-record-container {
            text-align: center;
            padding: 3rem;
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            color: #4a5568;
          }

          .no-record-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  const { patient: patientInfo, records } = medicalRecord;
  const summary = patientService.getMedicalSummary(medicalRecord);
  const contactInfo = patientService.formatContactInfo(patientInfo.contactInfo);
  const emergencyContact = patientService.formatEmergencyContact(patientInfo.emergencyContact);

  return (
    <div className="patient-record-view">
      {/* Patient Summary */}
      <div className="summary-section">
        <h3>My Medical Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{summary.totalRecords}</span>
            <span className="stat-label">Medical Records</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{summary.totalVisits}</span>
            <span className="stat-label">Total Visits</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{summary.totalVitalSigns}</span>
            <span className="stat-label">Vital Signs Recorded</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{summary.totalPrescriptions}</span>
            <span className="stat-label">Prescriptions</span>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="info-section">
        <h3>Personal Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Basic Information</h4>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{patientInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Insurance ID:</span>
                <span className="info-value">{patientInfo.insuranceID || 'Not provided'}</span>
              </div>
              {patientInfo.dateOfBirth && (
                <div className="info-row">
                  <span className="info-label">Date of Birth:</span>
                  <span className="info-value">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <h4>Contact Information</h4>
            <div className="info-content">
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{contactInfo.phone || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{contactInfo.email || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{contactInfo.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {emergencyContact.name && (
            <div className="info-card">
              <h4>Emergency Contact</h4>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{emergencyContact.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Relationship:</span>
                  <span className="info-value">{emergencyContact.relationship || 'Not specified'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{emergencyContact.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Records */}
      <div className="records-section">
        <h3>Medical History</h3>

        {records && records.length > 0 ? (
          records.map((record, recordIndex) => (
            <div key={record.recordID} className="record-card">
              <div className="record-header">
                <h4>Medical Record #{recordIndex + 1}</h4>
                <div className="record-meta">
                  <span className="record-date">
                    Created: {new Date(record.dateCreated).toLocaleDateString()}
                  </span>
                  {record.primaryPhysicianName && (
                    <span className="primary-physician">
                      Primary Physician: {record.primaryPhysicianName}
                    </span>
                  )}
                  <span className={`record-status ${record.status}`}>
                    {record.status}
                  </span>
                </div>
              </div>

              {record.visits && record.visits.length > 0 ? (
                <div className="visits-list">
                  {record.visits.map((visit) => (
                    <div key={visit.visitID} className="visit-card">
                      <div className="visit-header">
                        <div className="visit-title">
                          <h5>Visit on {new Date(visit.visitDate).toLocaleDateString()}</h5>
                          <span className="visit-reason">{visit.reason}</span>
                        </div>
                        <span
                          className="visit-status"
                          style={{ backgroundColor: patientService.getVisitStatusColor(visit.status) }}
                        >
                          {visit.status.replace('_', ' ')}
                        </span>
                      </div>

                      {visit.physicianName && (
                        <div className="visit-physician">
                          <strong>Physician:</strong> {visit.physicianName}
                        </div>
                      )}

                      {visit.notes && (
                        <div className="visit-notes">
                          <strong>Notes:</strong> {visit.notes}
                        </div>
                      )}

                      {/* Vital Signs */}
                      {visit.vitalSigns && visit.vitalSigns.length > 0 && (
                        <div className="vitals-section">
                          <h6>Vital Signs</h6>
                          <div className="vitals-grid">
                            {visit.vitalSigns.map((vital, index) => (
                              <div key={index} className="vital-item">
                                <div className="vital-type">
                                  {patientService.getVitalSignDisplayName(vital.measureType)}
                                </div>
                                <div className="vital-value">
                                  {patientService.formatVitalSignValue(vital)}
                                </div>
                                <div className="vital-date">
                                  {new Date(vital.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions */}
                      {visit.prescriptions && visit.prescriptions.length > 0 && (
                        <div className="prescriptions-section">
                          <h6>Prescriptions</h6>
                          <div className="prescriptions-list">
                            {visit.prescriptions.map((prescription, index) => (
                              <div key={index} className="prescription-item">
                                <div className="medication-name">{prescription.medicationName}</div>
                                <div className="prescription-details">
                                  <div><strong>Dosage:</strong> {prescription.dosage}</div>
                                  <div><strong>Frequency:</strong> {prescription.frequency}</div>
                                  <div><strong>Start Date:</strong> {new Date(prescription.startDate).toLocaleDateString()}</div>
                                  {prescription.endDate && (
                                    <div><strong>End Date:</strong> {new Date(prescription.endDate).toLocaleDateString()}</div>
                                  )}
                                  {prescription.instructions && (
                                    <div><strong>Instructions:</strong> {prescription.instructions}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-visits">
                  No visits recorded for this medical record
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-records">
            <div className="no-records-icon">📋</div>
            <h4>No Medical Records</h4>
            <p>You don't have any medical records in the system yet.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .patient-record-view {
          max-width: 1200px;
          margin: 0 auto;
        }

        .summary-section, .info-section, .records-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .summary-section h3, .info-section h3, .records-section h3 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          padding: 1.5rem;
          font-size: 1.5rem;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e9ecef;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: bold;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6c757d;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .info-card {
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          overflow: hidden;
        }

        .info-card h4 {
          background: #495057;
          color: white;
          margin: 0;
          padding: 1rem;
          font-size: 1.1rem;
        }

        .info-content {
          padding: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 600;
          color: #495057;
        }

        .info-value {
          color: #6c757d;
          text-align: right;
        }

        .record-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .record-header {
          background: #f8f9fa;
          padding: 1.5rem;
          border-bottom: 1px solid #dee2e6;
        }

        .record-header h4 {
          margin: 0 0 0.5rem 0;
          color: #495057;
        }

        .record-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .record-date, .primary-physician {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .record-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .record-status.active {
          background: #d4edda;
          color: #155724;
        }

        .record-status.archived {
          background: #f8d7da;
          color: #721c24;
        }

        .record-status.transferred {
          background: #fff3cd;
          color: #856404;
        }

        .visits-list {
          padding: 1.5rem;
        }

        .visit-card {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 1rem;
          padding: 1.5rem;
        }

        .visit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .visit-title h5 {
          margin: 0 0 0.25rem 0;
          color: #495057;
        }

        .visit-reason {
          color: #6c757d;
          font-style: italic;
        }

        .visit-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .visit-physician, .visit-notes {
          margin-bottom: 1rem;
          color: #495057;
        }

        .vitals-section, .prescriptions-section {
          margin-top: 1.5rem;
        }

        .vitals-section h6, .prescriptions-section h6 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-size: 1.1rem;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.5rem;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .vital-item {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          text-align: center;
        }

        .vital-type {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .vital-value {
          font-size: 1.2rem;
          color: #3498db;
          margin-bottom: 0.25rem;
        }

        .vital-date {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .prescriptions-list {
          display: grid;
          gap: 1rem;
        }

        .prescription-item {
          background: white;
          padding: 1.25rem;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .medication-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e74c3c;
        }

        .prescription-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .prescription-details div {
          color: #6c757d;
        }

        .prescription-details strong {
          color: #495057;
        }

        .no-visits, .no-records {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
          font-style: italic;
        }

        .no-records {
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          margin: 1.5rem 0;
        }

        .no-records-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .vitals-grid {
            grid-template-columns: 1fr;
          }

          .prescription-details {
            grid-template-columns: 1fr;
          }

          .visit-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PatientRecordView;
