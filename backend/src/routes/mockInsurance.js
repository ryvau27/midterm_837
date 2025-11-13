const express = require('express');
const InsuranceProvider = require('../models/InsuranceProvider');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// POST /api/mock/insurance/submit - Mock insurance provider billing submission
router.post('/insurance/submit', authorizeRole(['physician']), (req, res) => {
  const { billingSummary } = req.body;

  if (!billingSummary || !billingSummary.billingID) {
    return res.status(400).json({
      success: false,
      message: 'Valid billing summary is required'
    });
  }

  // Simulate processing time (0.5-2 seconds)
  const processingTime = Math.random() * 1500 + 500;

  setTimeout(() => {
    // Simulate different insurance responses
    const responses = [
      {
        submissionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        status: 'accepted',
        estimatedProcessingDays: Math.floor(Math.random() * 5) + 1,
        message: 'Claim submitted successfully'
      },
      {
        submissionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        status: 'accepted',
        estimatedProcessingDays: Math.floor(Math.random() * 5) + 1,
        message: 'Claim received and is being processed'
      },
      {
        submissionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        status: 'rejected',
        reason: 'Patient not covered under this plan',
        message: 'Claim rejected: Patient coverage verification failed'
      },
      {
        submissionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        status: 'rejected',
        reason: 'Invalid claim format',
        message: 'Claim rejected: Missing required procedure codes'
      },
      {
        submissionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        status: 'accepted',
        estimatedProcessingDays: Math.floor(Math.random() * 5) + 1,
        message: 'Claim accepted for review'
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    res.json({
      success: randomResponse.status === 'accepted',
      data: randomResponse
    });
  }, processingTime);
});

// GET /api/mock/insurance/status/:submissionId - Check mock submission status
router.get('/insurance/status/:submissionId', authorizeRole(['physician']), (req, res) => {
  const submissionId = req.params.submissionId;

  if (!submissionId || !submissionId.startsWith('MOCK-')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid submission ID'
    });
  }

  // Simulate status check
  const statuses = ['processing', 'approved', 'paid', 'denied', 'under_review'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  const statusResponse = {
    submissionId: submissionId,
    status: randomStatus,
    lastUpdated: new Date().toISOString(),
    details: getStatusDetails(randomStatus)
  };

  res.json({
    success: true,
    data: statusResponse
  });
});

// Helper function to get status details
function getStatusDetails(status) {
  const details = {
    processing: {
      message: 'Claim is being processed by the insurance provider',
      estimatedCompletion: '2-3 business days'
    },
    approved: {
      message: 'Claim has been approved for payment',
      estimatedPayment: '5-7 business days'
    },
    paid: {
      message: 'Claim has been paid',
      paymentDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    denied: {
      message: 'Claim has been denied',
      reason: 'Coverage limitations exceeded',
      appealInstructions: 'You may appeal this decision within 30 days'
    },
    under_review: {
      message: 'Claim is under manual review',
      estimatedCompletion: '3-5 business days',
      additionalInfo: 'Additional documentation may be required'
    }
  };

  return details[status] || { message: 'Status unknown' };
}

// GET /api/mock/insurance/providers - Get mock insurance providers
router.get('/insurance/providers', authorizeRole(['physician']), (req, res) => {
  const mockProviders = [
    {
      providerID: 1,
      providerName: 'MediCare Plus',
      contactInfo: JSON.stringify({
        phone: '1-800-MEDICARE',
        email: 'claims@medicareplus.com',
        address: '123 Health St, Medical City, MC 12345'
      }),
      apiEndpoint: 'https://api.medicareplus.com/claims',
      totalBillings: 45,
      paidBillings: 38,
      totalPaidAmount: 15750.00
    },
    {
      providerID: 2,
      providerName: 'HealthFirst Insurance',
      contactInfo: JSON.stringify({
        phone: '1-888-HEALTH1',
        email: 'billing@healthfirst.com',
        address: '456 Wellness Ave, Care Town, CT 67890'
      }),
      apiEndpoint: 'https://api.healthfirst.com/submit',
      totalBillings: 32,
      paidBillings: 28,
      totalPaidAmount: 12400.00
    },
    {
      providerID: 3,
      providerName: 'United Medical Group',
      contactInfo: JSON.stringify({
        phone: '1-877-UNITEDMED',
        email: 'providers@unitedmedical.com',
        address: '789 Care Blvd, Wellness City, WC 13579'
      }),
      apiEndpoint: 'https://api.unitedmedical.com/billing',
      totalBillings: 28,
      paidBillings: 24,
      totalPaidAmount: 9800.00
    }
  ];

  res.json({
    success: true,
    data: mockProviders
  });
});

module.exports = router;
