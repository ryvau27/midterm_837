const express = require('express');
const BillingSummary = require('../models/BillingSummary');
const InsuranceProvider = require('../models/InsuranceProvider');
const billingService = require('../services/billingService');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// GET /api/visits/unbilled - Get unbilled visits for the current physician
router.get('/visits/unbilled', authorizeRole(['physician']), (req, res) => {
  const physicianID = req.user.personID;

  billingService.getUnbilledVisits(physicianID, (err, visits) => {
    if (err) {
      console.error('Error fetching unbilled visits:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving unbilled visits'
      });
    }

    res.json({
      success: true,
      data: visits
    });
  });
});

// POST /api/billing/generate - Generate billing summaries for selected visits
router.post('/billing/generate', authorizeRole(['physician']), (req, res) => {
  const { visitIds } = req.body;
  const physicianID = req.user.personID;

  if (!Array.isArray(visitIds) || visitIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'visitIds must be a non-empty array'
    });
  }

  // Validate that all visitIds are numbers
  const invalidIds = visitIds.filter(id => isNaN(parseInt(id)));
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'All visit IDs must be valid numbers'
    });
  }

  billingService.generateBillingSummary(visitIds, physicianID, (err, billingSummaries) => {
    if (err) {
      console.error('Error generating billing summaries:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Error generating billing summaries'
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated ${billingSummaries.length} billing summar${billingSummaries.length === 1 ? 'y' : 'ies'}`,
      data: {
        billingSummaries: billingSummaries
      }
    });
  });
});

// GET /api/billing/stats - Get billing statistics for current physician
router.get('/billing/stats', authorizeRole(['physician']), (req, res) => {
  const physicianID = req.user.personID;

  billingService.getBillingStats(physicianID, (err, stats) => {
    if (err) {
      console.error('Error fetching billing stats:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving billing statistics'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  });
});

// GET /api/billing/:id - Get billing summary details
router.get('/billing/:id', authorizeRole(['physician']), (req, res) => {
  const billingID = parseInt(req.params.id);

  if (isNaN(billingID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid billing ID'
    });
  }

  BillingSummary.getById(billingID, (err, billing) => {
    if (err) {
      console.error('Error fetching billing summary:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving billing summary'
      });
    }

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing summary not found'
      });
    }

    // Verify physician owns this billing (through the visit)
    // This is a simplified check - in production you'd want more robust ownership validation
    if (billing.physicianID !== req.user.personID) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own billing summaries'
      });
    }

    res.json({
      success: true,
      data: billing
    });
  });
});

// POST /api/billing/:id/submit - Submit billing to insurance provider
router.post('/billing/:id/submit', authorizeRole(['physician']), (req, res) => {
  const billingID = parseInt(req.params.id);

  if (isNaN(billingID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid billing ID'
    });
  }

  // First verify the billing belongs to this physician
  BillingSummary.getById(billingID, (err, billing) => {
    if (err) {
      console.error('Error fetching billing for submission:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving billing summary'
      });
    }

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing summary not found'
      });
    }

    if (billing.physicianID !== req.user.personID) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only submit your own billing summaries'
      });
    }

    if (billing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Billing is already ${billing.status} and cannot be submitted`
      });
    }

    billingService.submitToInsurance(billingID, (err, result) => {
      if (err) {
        console.error('Error submitting to insurance:', err);
        return res.status(500).json({
          success: false,
          message: err.message || 'Error submitting billing to insurance'
        });
      }

      res.json({
        success: true,
        message: 'Billing submitted to insurance provider',
        data: result
      });
    });
  });
});

// GET /api/insurance/providers - Get all insurance providers
router.get('/insurance/providers', authorizeRole(['physician']), (req, res) => {
  InsuranceProvider.getAll((err, providers) => {
    if (err) {
      console.error('Error fetching insurance providers:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving insurance providers'
      });
    }

    res.json({
      success: true,
      data: providers
    });
  });
});

// GET /api/insurance/providers/:id - Get insurance provider details
router.get('/insurance/providers/:id', authorizeRole(['physician']), (req, res) => {
  const providerID = parseInt(req.params.id);

  if (isNaN(providerID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid provider ID'
    });
  }

  InsuranceProvider.getById(providerID, (err, provider) => {
    if (err) {
      console.error('Error fetching insurance provider:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving insurance provider'
      });
    }

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Insurance provider not found'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  });
});

module.exports = router;
