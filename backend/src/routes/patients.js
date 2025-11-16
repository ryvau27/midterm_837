const express = require('express');
const Patient = require('../models/Patient');
const { authenticateUser, authorizeRole, isolatePatientData } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Search patients (Physician only)
router.get('/search', authorizeRole(['physician']), (req, res) => {
  const { query } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  Patient.search(query.trim(), (err, patients) => {
    if (err) {
      console.error('Patient search error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error searching patients'
      });
    }

    // Remove sensitive information for search results
    const sanitizedPatients = patients.map(patient => ({
      personID: patient.personID,
      name: patient.name,
      insuranceID: patient.insuranceID,
      dateOfBirth: patient.dateOfBirth
    }));

    res.json({
      success: true,
      data: sanitizedPatients
    });
  });
});

// Get current patient's own data (Patient only)
// IMPORTANT: This must come BEFORE /:id route to prevent "me" being treated as an ID
router.get('/me', authorizeRole(['patient']), isolatePatientData, (req, res) => {
  const patientID = req.user.personID;
  const patient = new Patient({ personID: patientID });

  patient.getMedicalRecord((err, record) => {
    if (err) {
      console.error('Patient self-record retrieval error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving your medical record'
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Your medical record was not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  });
});

// Get patient by ID (Physician only)
router.get('/:id', authorizeRole(['physician']), (req, res) => {
  const patientID = parseInt(req.params.id);

  if (isNaN(patientID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID'
    });
  }

  const patient = new Patient({ personID: patientID });
  patient.getMedicalRecord((err, record) => {
    if (err) {
      console.error('Patient record retrieval error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving patient record'
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  });
});

module.exports = router;
