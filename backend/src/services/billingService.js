const BillingSummary = require('../models/BillingSummary');
const InsuranceProvider = require('../models/InsuranceProvider');
const Visit = require('../models/Visit');

/**
 * Billing calculation and management service
 */
const billingService = {
  /**
   * Calculate cost for a visit based on services provided
   * @param {number} visitID - Visit ID
   * @param {function} callback - Callback function
   */
  calculateVisitCost: (visitID, callback) => {
    Visit.getById(visitID, (err, visit) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!visit) {
        callback(new Error('Visit not found'), null);
        return;
      }

      // Get visit details including vital signs and prescriptions
      visit.getVitalSigns((err, vitals) => {
        if (err) {
          callback(err, null);
          return;
        }

        visit.getPrescriptions((err, prescriptions) => {
          if (err) {
            callback(err, null);
            return;
          }

          const cost = billingService.calculateCost(vitals, prescriptions);
          callback(null, {
            visitID: visitID,
            patientID: visit.patientID,
            cost: cost,
            breakdown: {
              vitalsCount: vitals.length,
              prescriptionsCount: prescriptions.length,
              vitalsCost: vitals.length * 25, // $25 per vital sign measurement
              prescriptionsCost: prescriptions.length * 15, // $15 per prescription
              baseVisitCost: 100 // $100 base visit fee
            }
          });
        });
      });
    });
  },

  /**
   * Calculate total cost based on services
   * @param {Array} vitals - Array of vital signs
   * @param {Array} prescriptions - Array of prescriptions
   * @returns {number} Total cost
   */
  calculateCost: (vitals, prescriptions) => {
    const baseVisitCost = 100; // Base fee for visit
    const vitalSignCost = 25; // Cost per vital sign measurement
    const prescriptionCost = 15; // Cost per prescription

    const totalCost = baseVisitCost +
                     (vitals.length * vitalSignCost) +
                     (prescriptions.length * prescriptionCost);

    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Generate billing summary for multiple visits
   * @param {Array} visitIds - Array of visit IDs
   * @param {number} physicianID - Physician ID creating the billing
   * @param {function} callback - Callback function
   */
  generateBillingSummary: (visitIds, physicianID, callback) => {
    if (!Array.isArray(visitIds) || visitIds.length === 0) {
      callback(new Error('At least one visit ID is required'), null);
      return;
    }

    const billingSummaries = [];
    let processedCount = 0;
    let errorOccurred = false;

    visitIds.forEach(visitId => {
      if (errorOccurred) return;

      Visit.getById(visitId, (err, visit) => {
        if (err) {
          errorOccurred = true;
          callback(err, null);
          return;
        }

        if (!visit) {
          errorOccurred = true;
          callback(new Error(`Visit ${visitId} not found`), null);
          return;
        }

        // Verify physician owns this visit
        if (visit.physicianID !== physicianID) {
          errorOccurred = true;
          callback(new Error(`Access denied: Visit ${visitId} does not belong to this physician`), null);
          return;
        }

        // Check if visit already has billing
        BillingSummary.visitHasBilling(visitId, (err, hasBilling) => {
          if (err) {
            errorOccurred = true;
            callback(err, null);
            return;
          }

          if (hasBilling) {
            errorOccurred = true;
            callback(new Error(`Visit ${visitId} already has billing`), null);
            return;
          }

          // Calculate cost
          billingService.calculateVisitCost(visitId, (err, costData) => {
            if (err) {
              errorOccurred = true;
              callback(err, null);
              return;
            }

            // Get patient's insurance provider (simplified - assign default)
            billingService.getPatientInsuranceProvider(costData.patientID, (err, providerID) => {
              if (err) {
                errorOccurred = true;
                callback(err, null);
                return;
              }

              // Create billing summary
              const billing = new BillingSummary({
                visitID: visitId,
                patientID: costData.patientID,
                totalCost: costData.cost,
                status: 'pending',
                insuranceProviderID: providerID
              });

              billing.save((err, result) => {
                if (err) {
                  errorOccurred = true;
                  callback(err, null);
                  return;
                }

                billingSummaries.push({
                  billingID: result.lastID,
                  visitID: visitId,
                  patientID: costData.patientID,
                  totalCost: costData.cost,
                  status: 'pending',
                  insuranceProviderID: providerID,
                  billingDate: new Date().toISOString(),
                  costBreakdown: costData.breakdown
                });

                processedCount++;
                if (processedCount === visitIds.length) {
                  callback(null, billingSummaries);
                }
              });
            });
          });
        });
      });
    });
  },

  /**
   * Get patient's insurance provider (simplified logic)
   * @param {number} patientID - Patient ID
   * @param {function} callback - Callback function
   */
  getPatientInsuranceProvider: (patientID, callback) => {
    // For demo purposes, assign patients to insurance providers based on ID
    // In a real system, this would be stored in patient records
    InsuranceProvider.getAll((err, providers) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (providers.length === 0) {
        callback(new Error('No insurance providers available'), null);
        return;
      }

      // Simple assignment based on patient ID
      const providerIndex = patientID % providers.length;
      callback(null, providers[providerIndex].providerID);
    });
  },

  /**
   * Submit billing to insurance provider
   * @param {number} billingID - Billing summary ID
   * @param {function} callback - Callback function
   */
  submitToInsurance: (billingID, callback) => {
    BillingSummary.getById(billingID, (err, billing) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!billing) {
        callback(new Error('Billing summary not found'), null);
        return;
      }

      if (billing.status !== 'pending') {
        callback(new Error(`Billing is already ${billing.status}`), null);
        return;
      }

      // Get insurance provider
      InsuranceProvider.getById(billing.insuranceProviderID, (err, provider) => {
        if (err) {
          callback(err, null);
          return;
        }

        if (!provider) {
          callback(new Error('Insurance provider not found'), null);
          return;
        }

        // Submit to mock insurance API
        provider.submitBilling(billing, (err, response) => {
          if (err) {
            callback(err, null);
            return;
          }

          // Update billing status based on insurance response
          const newStatus = response.success ? 'submitted' : 'denied';

          billing.status = newStatus;
          billing.update((err, updated) => {
            if (err) {
              callback(err, null);
              return;
            }

            callback(null, {
              billingID: billing.billingID,
              status: newStatus,
              insuranceResponse: response
            });
          });
        });
      });
    });
  },

  /**
   * Get unbilled visits for a physician
   * @param {number} physicianID - Physician ID
   * @param {function} callback - Callback function
   */
  getUnbilledVisits: (physicianID, callback) => {
    Visit.getUnbilledVisits(physicianID, (err, visits) => {
      if (err) {
        callback(err, null);
        return;
      }

      // Calculate estimated costs for each visit
      const visitsWithCosts = [];
      let processedCount = 0;

      if (visits.length === 0) {
        callback(null, []);
        return;
      }

      visits.forEach(visit => {
        billingService.calculateVisitCost(visit.visitID, (err, costData) => {
          if (err) {
            console.error(`Error calculating cost for visit ${visit.visitID}:`, err);
            visit.estimatedCost = 100; // Default fallback
          } else {
            visit.estimatedCost = costData.cost;
          }

          visitsWithCosts.push(visit);
          processedCount++;

          if (processedCount === visits.length) {
            callback(null, visitsWithCosts);
          }
        });
      });
    });
  },

  /**
   * Get billing statistics for a physician
   * @param {number} physicianID - Physician ID
   * @param {function} callback - Callback function
   */
  getBillingStats: (physicianID, callback) => {
    BillingSummary.getByPhysicianId(physicianID, (err, billings) => {
      if (err) {
        callback(err, null);
        return;
      }

      const stats = {
        totalBillings: billings.length,
        totalAmount: billings.reduce((sum, b) => sum + b.totalCost, 0),
        pendingCount: billings.filter(b => b.status === 'pending').length,
        submittedCount: billings.filter(b => b.status === 'submitted').length,
        paidCount: billings.filter(b => b.status === 'paid').length,
        deniedCount: billings.filter(b => b.status === 'denied').length,
        paidAmount: billings.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalCost, 0)
      };

      callback(null, stats);
    });
  }
};

module.exports = billingService;
