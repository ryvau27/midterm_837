const express = require('express');
const VitalSign = require('../models/VitalSign');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const PatientRecord = require('../models/PatientRecord');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const { validateVitalSigns } = require('../utils/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// POST /api/patients/:patientId/vitals - Add vital signs for a patient (Nurse only)
router.post('/patients/:patientId/vitals', authorizeRole(['nurse']), (req, res) => {
  const patientID = parseInt(req.params.patientId);
  const { visitId, vitalSigns } = req.body;
  const nurseID = req.user.personID;

  // Validate input
  if (isNaN(patientID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID'
    });
  }

  if (!Array.isArray(vitalSigns) || vitalSigns.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vital signs array is required and cannot be empty'
    });
  }

  // Validate vital signs data
  const validation = validateVitalSigns(vitalSigns);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  // Check if patient exists
  Patient.getById(patientID, (err, patient) => {
    if (err) {
      console.error('Patient lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying patient'
      });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get or create patient record
    PatientRecord.getByPatientId(patientID, (err, patientRecord) => {
      if (err) {
        console.error('Patient record lookup error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving patient record'
        });
      }

      if (!patientRecord) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      // Determine which visit to use
      let targetVisitId = visitId;

      if (targetVisitId) {
        // Verify the visit belongs to this patient
        Visit.getById(targetVisitId, (err, visit) => {
          if (err) {
            console.error('Visit lookup error:', err);
            return res.status(500).json({
              success: false,
              message: 'Error verifying visit'
            });
          }

          if (!visit || visit.patientID !== patientID) {
            return res.status(400).json({
              success: false,
              message: 'Invalid visit ID for this patient'
            });
          }

          // Use the provided visit
          saveVitalSigns(targetVisitId, validation.validatedVitals, nurseID, res);
        });
      } else {
        // Create a new visit for today's vital signs recording
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        const newVisit = new Visit({
          patientRecordID: patientRecord.recordID,
          visitDate: new Date().toISOString(),
          reason: 'Vital signs recording',
          notes: 'Automated visit for vital signs recording'
        });

        newVisit.save((err, result) => {
          if (err) {
            console.error('Visit creation error:', err);
            return res.status(500).json({
              success: false,
              message: 'Error creating visit record'
            });
          }

          targetVisitId = result.lastID;
          saveVitalSigns(targetVisitId, validation.validatedVitals, nurseID, res);
        });
      }
    });
  });
});

// Helper function to save vital signs
function saveVitalSigns(visitId, validatedVitals, nurseID, res) {
  const savedVitals = [];
  let errorOccurred = false;

  // Save each vital sign
  const saveNextVital = (index) => {
    if (index >= validatedVitals.length || errorOccurred) {
      if (errorOccurred) {
        return; // Error response already sent
      }

      // All vitals saved successfully
      res.status(201).json({
        success: true,
        message: 'Vital signs recorded successfully',
        data: {
          recordedCount: savedVitals.length,
          visitId: visitId,
          vitalSigns: savedVitals
        }
      });
      return;
    }

    const vitalData = validatedVitals[index];
    const vitalSign = new VitalSign({
      visitID: visitId,
      measureType: vitalData.measureType,
      value: vitalData.value,
      unit: vitalData.unit,
      recordedBy: nurseID
    });

    vitalSign.save((err, result) => {
      if (err) {
        console.error('Vital sign save error:', err);
        errorOccurred = true;
        return res.status(500).json({
          success: false,
          message: 'Error saving vital signs'
        });
      }

      savedVitals.push({
        vitalID: result.lastID,
        measureType: vitalData.measureType,
        value: vitalData.value,
        unit: vitalData.unit,
        timestamp: new Date().toISOString()
      });

      saveNextVital(index + 1);
    });
  };

  saveNextVital(0);
}

// GET /api/patients/:patientId/vitals - Get vital signs for a patient (Nurse/Physician only)
router.get('/patients/:patientId/vitals', authorizeRole(['nurse', 'physician']), (req, res) => {
  const patientID = parseInt(req.params.patientId);

  if (isNaN(patientID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid patient ID'
    });
  }

  // Check if patient exists
  Patient.getById(patientID, (err, patient) => {
    if (err) {
      console.error('Patient lookup error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying patient'
      });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get vital signs for this patient
    VitalSign.getByPatientId(patientID, (err, vitalSigns) => {
      if (err) {
        console.error('Vital signs retrieval error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error retrieving vital signs'
        });
      }

      res.json({
        success: true,
        data: vitalSigns
      });
    });
  });
});

// GET /api/visits/:visitId/vitals - Get vital signs for a specific visit
router.get('/visits/:visitId/vitals', authorizeRole(['nurse', 'physician']), (req, res) => {
  const visitID = parseInt(req.params.visitId);

  if (isNaN(visitID)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid visit ID'
    });
  }

  VitalSign.getByVisitId(visitID, (err, vitalSigns) => {
    if (err) {
      console.error('Vital signs retrieval error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving vital signs'
      });
    }

    res.json({
      success: true,
      data: vitalSigns
    });
  });
});

module.exports = router;
