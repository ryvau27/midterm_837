import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

const PatientRecord = ({ patient }) => {
  const [fullRecord, setFullRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient && patient.personID) {
      loadPatientRecord();
    }
  }, [patient]);

  const loadPatientRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientAPI.getById(patient.personID);
      setFullRecord(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load patient record');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading patient record...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (!fullRecord) {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: '#f39c12',
        color: 'white',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        Patient record not found
      </div>
    );
  }

  const { patient: patientInfo, records } = fullRecord;

  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      {/* Patient Header */}
      <div style={{ padding: '2rem', borderBottom: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Patient Medical Record</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>Patient Information</h4>
            <div style={{ lineHeight: '1.6' }}>
              <div><strong>Name:</strong> {patientInfo.name}</div>
              <div><strong>Insurance ID:</strong> {patientInfo.insuranceID || 'Not provided'}</div>
              {patientInfo.dateOfBirth && (
                <div><strong>Date of Birth:</strong> {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</div>
              )}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>Contact Information</h4>
            <div style={{ lineHeight: '1.6' }}>
              {(() => {
                try {
                  const contact = JSON.parse(patientInfo.contactInfo || '{}');
                  return (
                    <>
                      <div><strong>Phone:</strong> {contact.phone || 'Not provided'}</div>
                      <div><strong>Email:</strong> {contact.email || 'Not provided'}</div>
                      <div><strong>Address:</strong> {contact.address || 'Not provided'}</div>
                    </>
                  );
                } catch {
                  return <div>Contact information not available</div>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <div style={{ padding: '2rem' }}>
        {records && records.length > 0 ? (
          records.map((record, recordIndex) => (
            <div key={record.recordID} style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
                Medical Record #{recordIndex + 1}
                {record.primaryPhysicianName && (
                  <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '1rem' }}>
                    Primary Physician: {record.primaryPhysicianName}
                  </span>
                )}
              </h4>

              {record.visits && record.visits.length > 0 ? (
                record.visits.map((visit) => (
                  <div key={visit.visitID} style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h5 style={{ margin: 0, color: '#2c3e50' }}>
                        Visit on {new Date(visit.visitDate).toLocaleDateString()}
                      </h5>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: visit.status === 'completed' ? '#27ae60' : '#f39c12',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {visit.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Reason:</strong> {visit.reason}
                    </div>

                    {visit.physicianName && (
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Physician:</strong> {visit.physicianName}
                      </div>
                    )}

                    {visit.notes && (
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Notes:</strong> {visit.notes}
                      </div>
                    )}

                    {/* Vital Signs */}
                    {visit.vitalSigns && visit.vitalSigns.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>Vital Signs</h6>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                          {visit.vitalSigns.map((vital, index) => (
                            <div key={index} style={{
                              padding: '0.5rem',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}>
                              <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {vital.measureType.replace('_', ' ')}
                              </div>
                              <div>{vital.value} {vital.unit}</div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {new Date(vital.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {visit.prescriptions && visit.prescriptions.length > 0 && (
                      <div>
                        <h6 style={{ margin: '0 0 0.5rem 0', color: '#3498db' }}>Prescriptions</h6>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {visit.prescriptions.map((prescription, index) => (
                            <div key={index} style={{
                              padding: '0.75rem',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}>
                              <div style={{ fontWeight: 'bold' }}>{prescription.medicationName}</div>
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
                  No visits recorded for this medical record
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4>No Medical Records Found</h4>
            <p>This patient has no medical records in the system.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecord;
