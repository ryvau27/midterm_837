import React, { useState, useEffect } from 'react';
import billingService from '../services/billingService';

const BillingGenerator = () => {
  const [unbilledVisits, setUnbilledVisits] = useState([]);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedBillings, setGeneratedBillings] = useState([]);

  useEffect(() => {
    loadUnbilledVisits();
  }, []);

  const loadUnbilledVisits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await billingService.getUnbilledVisits();
      setUnbilledVisits(response.data || []);
    } catch (err) {
      console.error('Error loading unbilled visits:', err);
      setError('Failed to load unbilled visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSelection = (visitId) => {
    setSelectedVisits(prev =>
      prev.includes(visitId)
        ? prev.filter(id => id !== visitId)
        : [...prev, visitId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVisits.length === unbilledVisits.length) {
      setSelectedVisits([]);
    } else {
      setSelectedVisits(unbilledVisits.map(visit => visit.visitID));
    }
  };

  const handleGenerateBilling = async () => {
    if (selectedVisits.length === 0) {
      setError('Please select at least one visit to generate billing.');
      return;
    }

    // Validate selection
    const validation = billingService.validateVisitSelection(selectedVisits, unbilledVisits);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccess('');

      const response = await billingService.generateBilling(selectedVisits);

      if (response.success) {
        setSuccess(`Successfully generated ${response.data.billingSummaries.length} billing summar${response.data.billingSummaries.length === 1 ? 'y' : 'ies'}`);
        setGeneratedBillings(response.data.billingSummaries);

        // Refresh the unbilled visits list
        await loadUnbilledVisits();

        // Clear selections
        setSelectedVisits([]);
      } else {
        setError(response.message || 'Failed to generate billing');
      }
    } catch (err) {
      console.error('Error generating billing:', err);
      setError(err.response?.data?.message || 'Error generating billing. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitToInsurance = async (billingId) => {
    try {
      const response = await billingService.submitToInsurance(billingId);

      if (response.success) {
        setSuccess(`Billing submitted to insurance successfully!`);

        // Update the billing status in the generated billings list
        setGeneratedBillings(prev =>
          prev.map(billing =>
            billing.billingID === billingId
              ? { ...billing, status: 'submitted' }
              : billing
          )
        );
      } else {
        setError(response.message || 'Failed to submit billing to insurance');
      }
    } catch (err) {
      console.error('Error submitting to insurance:', err);
      setError(err.response?.data?.message || 'Error submitting to insurance. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="billing-generator">
        <div className="loading">Loading unbilled visits...</div>
      </div>
    );
  }

  return (
    <div className="billing-generator">
      <h3>Generate Billing Summaries</h3>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="billing-section">
        <div className="section-header">
          <h4>Unbilled Visits ({unbilledVisits.length})</h4>
          {unbilledVisits.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="select-all-btn"
            >
              {selectedVisits.length === unbilledVisits.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {unbilledVisits.length === 0 ? (
          <div className="no-visits">
            <p>No unbilled visits found. All visits have been billed.</p>
          </div>
        ) : (
          <div className="visits-list">
            {unbilledVisits.map(visit => (
              <div key={visit.visitID} className="visit-item">
                <div className="visit-checkbox">
                  <input
                    type="checkbox"
                    id={`visit-${visit.visitID}`}
                    checked={selectedVisits.includes(visit.visitID)}
                    onChange={() => handleVisitSelection(visit.visitID)}
                  />
                </div>

                <div className="visit-info">
                  <div className="visit-header">
                    <strong>{visit.patientName}</strong>
                    <span className="visit-date">
                      {new Date(visit.visitDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="visit-details">
                    <span className="visit-reason">{visit.reason}</span>
                    <span className="estimated-cost">
                      Est. Cost: {billingService.formatCurrency(visit.estimatedCost)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedVisits.length > 0 && (
          <div className="selection-summary">
            <p>
              <strong>{selectedVisits.length}</strong> visit{selectedVisits.length === 1 ? '' : 's'} selected
              {selectedVisits.length > 0 && (
                <span>
                  {' '}• Estimated Total: {billingService.formatCurrency(
                    unbilledVisits
                      .filter(visit => selectedVisits.includes(visit.visitID))
                      .reduce((total, visit) => total + visit.estimatedCost, 0)
                  )}
                </span>
              )}
            </p>

            <button
              onClick={handleGenerateBilling}
              disabled={generating}
              className="generate-btn"
            >
              {generating ? 'Generating...' : 'Generate Billing'}
            </button>
          </div>
        )}
      </div>

      {generatedBillings.length > 0 && (
        <div className="billing-section">
          <h4>Generated Billing Summaries</h4>

          <div className="generated-billings">
            {generatedBillings.map(billing => (
              <div key={billing.billingID} className="billing-item">
                <div className="billing-header">
                  <div className="billing-info">
                    <strong>Billing #{billing.billingID}</strong>
                    <span className="billing-amount">
                      {billingService.formatCurrency(billing.totalCost)}
                    </span>
                  </div>

                  <div className="billing-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: billingService.getStatusColor(billing.status) }}
                    >
                      {billingService.getStatusText(billing.status)}
                    </span>
                  </div>
                </div>

                <div className="billing-details">
                  <div>Visit ID: {billing.visitID}</div>
                  <div>Patient ID: {billing.patientID}</div>
                  <div>Generated: {new Date(billing.billingDate).toLocaleDateString()}</div>
                </div>

                {billing.status === 'pending' && (
                  <button
                    onClick={() => handleSubmitToInsurance(billing.billingID)}
                    className="submit-insurance-btn"
                  >
                    Submit to Insurance
                  </button>
                )}

                {billing.status === 'submitted' && (
                  <div className="submitted-notice">
                    ✅ Submitted to insurance provider
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .billing-generator {
          max-width: 1000px;
          margin: 0 auto;
        }

        .billing-generator h3 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .billing-generator h4 {
          color: #34495e;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .error-message {
          background: #fee;
          color: #c53030;
          padding: 1rem;
          border-radius: 4px;
          border: 1px solid #fecaca;
          margin-bottom: 1rem;
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 1rem;
          border-radius: 4px;
          border: 1px solid #c3e6cb;
          margin-bottom: 1rem;
        }

        .billing-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #dee2e6;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .select-all-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .select-all-btn:hover {
          background: #5a6268;
        }

        .no-visits {
          text-align: center;
          color: #6c757d;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .visits-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }

        .visit-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #f1f3f4;
          transition: background-color 0.2s;
        }

        .visit-item:hover {
          background-color: #f8f9fa;
        }

        .visit-item:last-child {
          border-bottom: none;
        }

        .visit-checkbox {
          margin-right: 1rem;
        }

        .visit-info {
          flex: 1;
        }

        .visit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .visit-date {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .visit-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #495057;
        }

        .estimated-cost {
          font-weight: 600;
          color: #28a745;
        }

        .selection-summary {
          margin-top: 1rem;
          padding: 1rem;
          background: #e9ecef;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .generate-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .generate-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .generate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .generated-billings {
          display: grid;
          gap: 1rem;
        }

        .billing-item {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 1rem;
          background: #f8f9fa;
        }

        .billing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .billing-info strong {
          color: #495057;
        }

        .billing-amount {
          font-size: 1.2rem;
          font-weight: 600;
          color: #28a745;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .billing-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6c757d;
          margin-bottom: 1rem;
        }

        .submit-insurance-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .submit-insurance-btn:hover {
          background: #218838;
        }

        .submitted-notice {
          color: #155724;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .selection-summary {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .billing-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .visit-details {
            flex-direction: column;
            gap: 0.25rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default BillingGenerator;
